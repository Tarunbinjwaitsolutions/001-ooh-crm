# How to Fix: "Site(s) not found" Error

## What's Happening

You have a campaign in the database that references a site ID (`147852369874128963215278`) that no longer exists. This could happen if:
- A site was deleted after the campaign was created
- The site ID was entered incorrectly
- A data migration went wrong

When you try to **approve** the campaign, the system now validates that all sites exist (this is new validation we added to prevent issues). Since the site is missing, it blocks the approval with a clear error.

## Solution: Run the Cleanup Script

### Step 1: Identify the Problem

```bash
cd backend
npm run cleanup:campaigns
```

This will scan all campaigns and show which ones have invalid site references. You'll see output like:

```
📋 Scanning campaigns for invalid site references...

⚠️  MO-C-2026-0001: Missing sites: 147852369874128963215278

💡 Found issues in 1 campaign(s)

To fix these issues, run:
   npm run cleanup:campaigns -- --fix
```

### Step 2: Fix the Campaign(s)

```bash
npm run cleanup:campaigns -- --fix
```

The script will:
- Remove the invalid site ID(s) from the campaign
- Keep the campaign and any valid site references
- Report what was fixed

Output example:

```
🔧 Repairing campaigns...

✅ MO-C-2026-0001: Removed 1 invalid site(s)

🎉 Repaired 1 campaign(s)
```

### Step 3: Verify the Fix

```bash
npm run cleanup:campaigns
```

Should now show:
```
✅ All campaigns have valid site references.
```

## After Cleanup

- The problematic campaign will have the invalid site ID removed
- If the campaign had other valid sites, those will remain
- You can now approve the campaign
- Try changing the campaign status again in the UI

## Prevention

From now on:
- You cannot create campaigns with non-existent sites
- You cannot create campaigns from quotations with missing sites
- You cannot approve campaigns that reference deleted sites
- Clear error messages will tell you exactly which sites are missing

## If Issues Persist

If after cleanup you still see the error:

1. **Verify the site exists**: Check the Sites inventory to ensure the site you want isn't actually deleted
2. **Check campaign manually**: 
   ```bash
   db.campaigns.findOne({campaignCode: "MO-C-2026-0001"})
   ```
   Look at the `siteIds` array and verify each ID exists in the `sites` collection

3. **Contact Support**: If you need help, provide:
   - The campaign code (e.g., `MO-C-2026-0001`)
   - The missing site ID(s)
   - When the campaign was created
