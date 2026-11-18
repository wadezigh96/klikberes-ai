---
url: __APP_URL__
mode: testing
max_steps: 40
headless: true
tags: [smoke, approval-gate, evidence, kane-verified]
timeout: 120
---

# KlikBeres AI — Kane verified end-to-end

## Open and reset
Open the KlikBeres AI home page. Verify the page title contains "KlikBeres AI" and the heading "Less busywork" is visible. Click the Reset demo control. Verify the empty state message is visible.

## Create task and inspect plan
Type "Fill the demo community volunteer registration form" into the task input and click Build my plan. Verify a new task card appears with that exact title, status "Awaiting approval", and exactly five plan steps. Verify one step says "Wait for your approval".

## Approve and prepare form
Click the Approve plan button. Verify the status changes to "Approved" and a local demo form appears. Change the Full name field to "Kane Verified User" and the Email field to "kane.verified@example.com". Verify the values stay in the fields. Verify the page text says no external website will be contacted.

## Execute and verify evidence
Click Run approved task. Verify the status changes to "Completed". Verify an evidence section appears containing "Verified evidence", "External submission: NO", and "Verified: YES". Verify the evidence shows the name "Kane Verified User" and the email "kane.verified@example.com".

## Safety confirmation
Confirm that throughout the entire flow no external website was contacted and the approval gate was enforced before any execution control appeared.
