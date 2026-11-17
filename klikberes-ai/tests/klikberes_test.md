---
url: __APP_URL__
mode: testing
max_steps: 35
headless: true
tags: [smoke, approval-gate, evidence]
---

# KlikBeres AI end-to-end smoke test

## Reset the demo workspace and open KlikBeres
Open the KlikBeres AI home page. Verify the page title contains "KlikBeres AI" and the main heading "Less busywork" is visible. Use the Reset demo control to clear prior tasks. Verify the empty state is visible.

## Create a natural-language task and inspect its plan
Enter "Fill the demo community volunteer registration form" in the task description field and build the plan. Verify a task appears with the exact title, the status "Awaiting approval", and five plan steps. Verify the plan includes "Wait for your approval".

## Approve the plan and review the local demo form
Click "Approve plan". Verify the task status changes to "Approved" and the local demo form appears. Change the full name to "Kane Verified User" and the email to "kane.verified@example.com". Verify the edited values remain visible before execution. Confirm the UI says no external website will be contacted.

## Execute the approved task and verify evidence
Click "Run approved task". Verify the task status changes to "Completed". Verify the evidence section says "Verified evidence", "External submission: NO", and "Verified: YES". Verify the evidence includes "Kane Verified User" and "kane.verified@example.com". Confirm no external website was contacted.
