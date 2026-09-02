# How We Learn Now — anonymous questionnaire

A small, dependency-free web questionnaire for college students across all majors. It uses open-text prompts, keeps responses anonymous, and appends each valid submission to `data/responses.csv`, which opens directly in Excel.

## Run locally

From this folder, run:

```powershell
node server.mjs
```

Then open [http://localhost:4173](http://localhost:4173).

To share it with people on the same Wi-Fi network, find your computer's local IPv4 address and share `http://YOUR-IP:4173`. Windows Firewall may ask for permission for Node on private networks.

## Response log

The response file is `data/responses.csv`. It is written with a UTF-8 BOM and quoted fields so Excel can open long answers cleanly. It contains only a random response ID, UTC timestamp, and answers; no name, email, IP address, or user agent is recorded.

For a protected browser download, set an admin key before starting the server:

```powershell
$env:ADMIN_KEY = "choose-a-long-private-key"
node server.mjs
```

Then use `/admin/download?key=choose-a-long-private-key`. Do not share that URL publicly.

## Vercel deployment

The repository includes Vercel Functions in `/api` and a `vercel.json` configuration. The form is served as static HTML, while submissions are stored as private JSON blobs in Vercel Blob. The owner export endpoint combines those records into an Excel-compatible CSV.

1. In the Vercel project, open **Storage → Create Database → Blob**.
2. Choose **Private** storage and connect the store to the `primary-research` project for Production (and Preview if needed). Vercel will provide the Blob environment variables to the project.
3. Add a long random `ADMIN_KEY` environment variable in Vercel for Production.
4. Redeploy the project from GitHub.
5. Download responses from `/api/admin-export?key=YOUR_ADMIN_KEY` and open the CSV in Excel.

The Blob store is intentionally private; respondents only receive a success response, and the export route is protected by `ADMIN_KEY`. Do not put `ADMIN_KEY` or any Blob token in the repository.

The supplied `data/questionnaire_responses_template.xlsx` is a formatted Excel starter workbook with a response-log sheet and a question map. You can use it to analyse the downloaded CSV after gathering responses.

## Question design note

The source image skips from question 14 to 16. The final prompt is labelled 15 in this form so the questionnaire has a continuous sequence. Yes/no wording was converted into open prompts so respondents can explain their experience.
