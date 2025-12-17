;; sBTC Collateralized Lending Protocol - Clarity 4
;; Borrow against sBTC with time-based interest
;;
;; Clarity 4 Features Used:
;; - stacks-block-time: Real-time interest accrual
;; - contract-hash?: Verify approved collateral tokens
;; - to-ascii?: Generate loan receipts
;; - print: Event logging for monitoring

;; ============================================
;; CONSTANTS
;; ============================================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u4001))
(define-constant ERR_INVALID_AMOUNT (err u4002))
(define-constant ERR_LOAN_NOT_FOUND (err u4003))
(define-constant ERR_INSUFFICIENT_COLLATERAL (err u4004))
(define-constant ERR_LOAN_NOT_DUE (err u4005))
(define-constant ERR_ALREADY_LIQUIDATED (err u4006))
(define-constant ERR_COLLATERAL_NOT_APPROVED (err u4007))
(define-constant ERR_REPAYMENT_EXCEEDS_DEBT (err u4008))
(define-constant ERR_BELOW_MIN_COLLATERAL (err u4009))

;; Protocol parameters
(define-constant MIN_COLLATERAL_RATIO u15000) ;; 150% in basis points
(define-constant LIQUIDATION_THRESHOLD u12000) ;; 120% triggers liquidation
(define-constant LIQUIDATION_BONUS u500) ;; 5% bonus for liquidators
(define-constant BASE_INTEREST_RATE u500) ;; 5% base APR
(define-constant SECONDS_PER_YEAR u31536000)

;; ============================================
;; DATA STRUCTURES
;; ============================================

;; Loan positions
(define-map loans
  { loan-id: uint }
  {
    borrower: principal,
    collateral-amount: uint,
    borrowed-amount: uint,
    interest-rate: uint,
    created-at: uint,
    last-accrual: uint,
    accrued-interest: uint,
    collateral-token: principal,
    is-active: bool
  }
)

;; Approved collateral tokens
(define-map approved-collaterals
  { token-hash: (buff 32) }
  {
    token-name: (string-ascii 32),
    ltv-ratio: uint,  ;; Loan-to-value ratio
    is-active: bool,
    price-feed: principal
  }
)

;; User positions summary
(define-map user-positions
  { user: principal }
  {
    total-collateral: uint,
    total-borrowed: uint,
    loan-count: uint,
    health-factor: uint
  }
)

;; Protocol stats
(define-data-var next-loan-id uint u1)
(define-data-var total-collateral-locked uint u0)
(define-data-var total-borrowed uint u0)
(define-data-var protocol-fees uint u0)

;; Simulated sBTC price (in microSTX per sat)
(define-data-var sbtc-price uint u50000) ;; 50k STX per BTC

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

;; Get loan details
(define-read-only (get-loan (loan-id uint))
  (map-get? loans { loan-id: loan-id })
)

;; Get current timestamp
(define-read-only (get-current-time)
  stacks-block-time
)

;; Calculate accrued interest using real time
(define-read-only (calculate-interest (loan-id uint))
  (match (map-get? loans { loan-id: loan-id })
    loan
    (let
      (
        (principal-amt (get borrowed-amount loan))
        (rate (get interest-rate loan))
        (last-accrual (get last-accrual loan))
        (time-elapsed (- stacks-block-time last-accrual))
        (existing-interest (get accrued-interest loan))
        ;; Interest = principal * rate * time / (year * 10000)
        (new-interest (/ (* (* principal-amt rate) time-elapsed) 
                        (* SECONDS_PER_YEAR u10000)))
      )
      (ok {
        principal: principal-amt,
        existing-interest: existing-interest,
        new-interest: new-interest,
        total-interest: (+ existing-interest new-interest),
        total-debt: (+ principal-amt existing-interest new-interest),
        time-elapsed-seconds: time-elapsed
      })
    )
    (err u0)
  )
)

;; Calculate health factor
(define-read-only (get-health-factor (loan-id uint))
  (match (map-get? loans { loan-id: loan-id })
    loan
    (let
      (
        (collateral (get collateral-amount loan))
        (collateral-value (* collateral (var-get sbtc-price)))
        (interest-calc (unwrap-panic (calculate-interest loan-id)))
        (total-debt (get total-debt interest-calc))
      )
      (if (> total-debt u0)
        (ok (/ (* collateral-value u10000) total-debt))
        (ok u999999) ;; Infinite health if no debt
      )
    )
    (err u0)
  )
)

;; Check if loan is liquidatable
(define-read-only (is-liquidatable (loan-id uint))
  (match (get-health-factor loan-id)
    health (ok (< health LIQUIDATION_THRESHOLD))
    (err u0)
  )
)

;; Generate loan receipt
(define-read-only (generate-loan-receipt (loan-id uint) (amount uint) (collateral uint))
  (let
    (
      (loan-str (unwrap-panic (to-ascii? loan-id)))
      (amount-str (unwrap-panic (to-ascii? amount)))
      (collateral-str (unwrap-panic (to-ascii? collateral)))
      (time-str (unwrap-panic (to-ascii? stacks-block-time)))
    )
    (concat "LOAN_RECEIPT|ID:"
      (concat loan-str
        (concat "|BORROWED:"
          (concat amount-str
            (concat "|COLLATERAL:"
              (concat collateral-str
                (concat "|TIMESTAMP:" time-str)
              )
            )
          )
        )
      )
    )
  )
)

;; Get user position summary
(define-read-only (get-user-position (user principal))
  (default-to 
    { total-collateral: u0, total-borrowed: u0, loan-count: u0, health-factor: u999999 }
    (map-get? user-positions { user: user })
  )
)

;; Get protocol stats
(define-read-only (get-protocol-stats)
  {
    total-collateral: (var-get total-collateral-locked),
    total-borrowed: (var-get total-borrowed),
    protocol-fees: (var-get protocol-fees),
    sbtc-price: (var-get sbtc-price)
  }
)

;; ============================================
;; PUBLIC FUNCTIONS
;; ============================================

;; Approve a collateral token (admin)
(define-public (approve-collateral 
    (token-contract principal)
    (token-name (string-ascii 32))
    (ltv-ratio uint)
  )
  (let
    (
      (token-hash (unwrap! (contract-hash? token-contract) ERR_COLLATERAL_NOT_APPROVED))
    )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)

    (map-set approved-collaterals
      { token-hash: token-hash }
      {
        token-name: token-name,
        ltv-ratio: ltv-ratio,
        is-active: true,
        price-feed: CONTRACT_OWNER
      }
    )

    (print {
      event: "collateral-approved",
      token-contract: token-contract,
      token-name: token-name,
      ltv-ratio: ltv-ratio,
      timestamp: stacks-block-time
    })

    (ok token-hash)
  )
)

;; Check if collateral is approved
(define-read-only (is-collateral-approved (token-contract principal))
  (match (contract-hash? token-contract)
    hash (match (map-get? approved-collaterals { token-hash: hash })
           info (get is-active info)
           false)
    false
  )
)

;; Deposit collateral and borrow
(define-public (borrow 
    (collateral-amount uint)
    (borrow-amount uint)
  )
  (let
    (
      (loan-id (var-get next-loan-id))
      (collateral-value (* collateral-amount (var-get sbtc-price)))
      (min-collateral (/ (* borrow-amount MIN_COLLATERAL_RATIO) u10000))
      (user-pos (get-user-position tx-sender))
    )
    ;; Validate amounts
    (asserts! (> collateral-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> borrow-amount u0) ERR_INVALID_AMOUNT)
    
    ;; Check collateral ratio
    (asserts! (>= collateral-value min-collateral) ERR_INSUFFICIENT_COLLATERAL)
    
    ;; Transfer collateral to contract (simulate with STX for demo)
    (try! (stx-transfer? collateral-amount tx-sender (as-contract tx-sender)))
    
    ;; Create loan
    (map-set loans
      { loan-id: loan-id }
      {
        borrower: tx-sender,
        collateral-amount: collateral-amount,
        borrowed-amount: borrow-amount,
        interest-rate: BASE_INTEREST_RATE,
        created-at: stacks-block-time,
        last-accrual: stacks-block-time,
        accrued-interest: u0,
        collateral-token: CONTRACT_OWNER, ;; Placeholder for sBTC
        is-active: true
      }
    )
    
    ;; Transfer borrowed amount to user
    (try! (as-contract (stx-transfer? borrow-amount tx-sender tx-sender)))
    
    ;; Update user position
    (map-set user-positions
      { user: tx-sender }
      {
        total-collateral: (+ (get total-collateral user-pos) collateral-amount),
        total-borrowed: (+ (get total-borrowed user-pos) borrow-amount),
        loan-count: (+ (get loan-count user-pos) u1),
        health-factor: u0 ;; Recalculated on query
      }
    )
    
    ;; Update protocol stats
    (var-set total-collateral-locked (+ (var-get total-collateral-locked) collateral-amount))
    (var-set total-borrowed (+ (var-get total-borrowed) borrow-amount))
    (var-set next-loan-id (+ loan-id u1))

    (print {
      event: "loan-created",
      loan-id: loan-id,
      borrower: tx-sender,
      collateral-amount: collateral-amount,
      borrowed-amount: borrow-amount,
      interest-rate: BASE_INTEREST_RATE,
      timestamp: stacks-block-time
    })

    (ok {
      loan-id: loan-id,
      receipt: (generate-loan-receipt loan-id borrow-amount collateral-amount)
    })
  )
)

;; Repay loan (partial or full)
(define-public (repay (loan-id uint) (amount uint))
  (let
    (
      (loan (unwrap! (map-get? loans { loan-id: loan-id }) ERR_LOAN_NOT_FOUND))
      (borrower (get borrower loan))
      (interest-calc (unwrap! (calculate-interest loan-id) ERR_LOAN_NOT_FOUND))
      (total-debt (get total-debt interest-calc))
    )
    ;; Verify borrower
    (asserts! (is-eq tx-sender borrower) ERR_UNAUTHORIZED)
    (asserts! (get is-active loan) ERR_LOAN_NOT_FOUND)
    (asserts! (<= amount total-debt) ERR_REPAYMENT_EXCEEDS_DEBT)
    
    ;; Transfer repayment
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Calculate how much goes to interest vs principal
    (let
      (
        (total-interest (get total-interest interest-calc))
        (interest-payment (if (>= amount total-interest) total-interest amount))
        (principal-payment (- amount interest-payment))
        (new-borrowed (- (get borrowed-amount loan) principal-payment))
        (new-interest (- total-interest interest-payment))
      )
      ;; Update loan
      (map-set loans
        { loan-id: loan-id }
        (merge loan {
          borrowed-amount: new-borrowed,
          accrued-interest: new-interest,
          last-accrual: stacks-block-time,
          is-active: (> new-borrowed u0)
        })
      )
      
      ;; If fully repaid, return collateral
      (if (is-eq new-borrowed u0)
        (try! (as-contract (stx-transfer? (get collateral-amount loan) tx-sender borrower)))
        true
      )
      
      ;; Update protocol stats
      (var-set total-borrowed (- (var-get total-borrowed) principal-payment))
      (var-set protocol-fees (+ (var-get protocol-fees) interest-payment))

      (print {
        event: "loan-repaid",
        loan-id: loan-id,
        borrower: borrower,
        amount: amount,
        interest-paid: interest-payment,
        principal-paid: principal-payment,
        remaining-debt: (+ new-borrowed new-interest),
        fully-repaid: (is-eq new-borrowed u0),
        timestamp: stacks-block-time
      })

      (ok {
        interest-paid: interest-payment,
        principal-paid: principal-payment,
        remaining-debt: (+ new-borrowed new-interest)
      })
    )
  )
)

;; Add collateral to existing loan
(define-public (add-collateral (loan-id uint) (amount uint))
  (let
    (
      (loan (unwrap! (map-get? loans { loan-id: loan-id }) ERR_LOAN_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (get borrower loan)) ERR_UNAUTHORIZED)
    (asserts! (get is-active loan) ERR_LOAN_NOT_FOUND)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Transfer additional collateral
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update loan
    (map-set loans
      { loan-id: loan-id }
      (merge loan { 
        collateral-amount: (+ (get collateral-amount loan) amount)
      })
    )
    
    ;; Update protocol stats
    (var-set total-collateral-locked (+ (var-get total-collateral-locked) amount))

    (print {
      event: "collateral-added",
      loan-id: loan-id,
      borrower: tx-sender,
      amount: amount,
      new-total-collateral: (+ (get collateral-amount loan) amount),
      timestamp: stacks-block-time
    })

    (ok (+ (get collateral-amount loan) amount))
  )
)

;; Liquidate underwater loan
(define-public (liquidate (loan-id uint))
  (let
    (
      (loan (unwrap! (map-get? loans { loan-id: loan-id }) ERR_LOAN_NOT_FOUND))
      (health (unwrap! (get-health-factor loan-id) ERR_LOAN_NOT_FOUND))
      (interest-calc (unwrap! (calculate-interest loan-id) ERR_LOAN_NOT_FOUND))
      (total-debt (get total-debt interest-calc))
      (collateral (get collateral-amount loan))
      ;; Liquidator pays debt, gets collateral + bonus
      (bonus-amount (/ (* collateral LIQUIDATION_BONUS) u10000))
      (liquidator-reward (+ collateral bonus-amount))
    )
    ;; Check loan is liquidatable
    (asserts! (get is-active loan) ERR_ALREADY_LIQUIDATED)
    (asserts! (< health LIQUIDATION_THRESHOLD) ERR_LOAN_NOT_DUE)
    
    ;; Liquidator pays off the debt
    (try! (stx-transfer? total-debt tx-sender (as-contract tx-sender)))
    
    ;; Liquidator receives collateral (simplified - in real protocol would be from pool)
    (try! (as-contract (stx-transfer? collateral tx-sender tx-sender)))
    
    ;; Close the loan
    (map-set loans
      { loan-id: loan-id }
      (merge loan {
        is-active: false,
        borrowed-amount: u0,
        collateral-amount: u0,
        accrued-interest: u0
      })
    )
    
    ;; Update protocol stats
    (var-set total-collateral-locked (- (var-get total-collateral-locked) collateral))
    (var-set total-borrowed (- (var-get total-borrowed) (get borrowed-amount loan)))

    (print {
      event: "loan-liquidated",
      loan-id: loan-id,
      borrower: (get borrower loan),
      liquidator: tx-sender,
      debt-paid: total-debt,
      collateral-received: collateral,
      health-factor: health,
      timestamp: stacks-block-time
    })

    (ok {
      debt-paid: total-debt,
      collateral-received: collateral,
      liquidator: tx-sender
    })
  )
)

;; Update sBTC price (oracle simulation - admin only)
(define-public (set-sbtc-price (new-price uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set sbtc-price new-price)

    (print {
      event: "price-updated",
      old-price: (var-get sbtc-price),
      new-price: new-price,
      timestamp: stacks-block-time
    })

    (ok new-price)
  )
)
