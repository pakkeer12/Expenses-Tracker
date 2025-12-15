# 🔧 Loan Save Error - Troubleshooting

## Changes Made to Fix Common Issues

### 1. ✅ Updated Schema Validation
**File:** `shared/schema.ts`

Made new fields optional with default values:
- `tenure`: Defaults to 12 months if not provided
- `startDate`: Defaults to today's date
- `calculationMethod`: Defaults to 'reducing'
- `paymentFrequency`: Defaults to 'monthly'

### 2. ✅ Fixed Data Conversion
**File:** `client/src/pages/Loans.tsx`

Added `tenure` field conversion to integer:
```typescript
const loanData = {
  ...loan,
  totalAmount: parseFloat(loan.totalAmount),
  paidAmount: parseFloat(loan.paidAmount),
  interestRate: parseFloat(loan.interestRate),
  tenure: parseInt(loan.tenure), // ← Added this
};
```

## How to Test the Fix

1. **Refresh your browser** (Ctrl+R or Cmd+R)
2. **Navigate to Loans page**
3. **Click "Add Loan"**
4. **Fill in the form** with test data:
   - Loan Name: Test Loan
   - Type: personal
   - Amount: 10000
   - Interest: 12
   - Tenure: 12
   - Start Date: (select today)
   - Lender: Test Bank
   - Due Date: (select future date)
5. **Click "Save Loan"**

## Expected Behavior

✅ Loan should save successfully
✅ You should see a success toast message
✅ The loan should appear in the list below
✅ EMI should be calculated and displayed

## If Still Getting Errors

### Check Browser Console

1. Open Browser DevTools (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Look for error messages (red text)
4. **Copy the error message** and share it

### Check Network Tab

1. In DevTools, go to **Network** tab
2. Try saving a loan again
3. Look for a **POST** request to `/api/loans`
4. Click on it
5. Check the **Response** tab for error details
6. Check the **Payload** tab to see what data was sent

### Common Error Scenarios

#### Scenario 1: "Validation Error" Toast
**Problem:** Form validation failing
**Check:** Make sure all required fields are filled (*marked fields)

#### Scenario 2: "tenure is required" or similar
**Problem:** Schema validation on backend
**Solution:** The schema updates should fix this. Make sure server restarted.

#### Scenario 3: "Cannot read property..." error
**Problem:** Frontend trying to access undefined property
**Check:** Browser console for the full error stack

#### Scenario 4: Server 500 error
**Problem:** Database or server-side issue
**Check:** Terminal output for error details

## Quick Verification Checklist

- [ ] Server is running (check terminal - should show "serving on port 8000")
- [ ] Browser page is refreshed after code changes
- [ ] All required form fields are filled
- [ ] Dates are valid (start date before due date)
- [ ] Numbers are positive values
- [ ] No console errors before clicking save

## Sample Working Data

Use this data for testing:

```json
{
  "name": "Test Car Loan",
  "type": "auto",
  "totalAmount": "50000",
  "paidAmount": "0",
  "interestRate": "12",
  "tenure": "24",
  "startDate": "2025-12-16",
  "dueDate": "2027-12-16",
  "lender": "Test Bank",
  "calculationMethod": "reducing",
  "paymentFrequency": "monthly"
}
```

This should produce an EMI of approximately ₹4,707/month.

## Server Output to Watch

When you save a loan, you should see in terminal:
```
[express] POST /api/loans 201 in XXms :: {"id":"...","name":"Test Car Loan",...}
```

If you see `400` or `500` status code instead of `201`, there's a validation or server error.

## Next Steps

1. Try saving a loan now with the fixes applied
2. If it works - great! Continue testing other features
3. If still errors - check the scenarios above and share:
   - The exact error message
   - Browser console output
   - Network tab response
   - Terminal/server output

---

**Status:** Fixes applied, ready for testing
**Last Updated:** Dec 16, 2025
