# How We Learn Now — anonymous questionnaire

A small web questionnaire for college students across all majors. It uses open-text prompts, keeps responses anonymous, and stores each valid submission in a private response log. Local runs append to `data/responses.csv`; Vercel runs store private JSON records in Vercel Blob.

## Run locally

From this folder, run:

```powershell
pnpm install
pnpm start
```

Then open [http://localhost:4173](http://localhost:4173).

To share it with people on the same Wi-Fi network, find your computer's local IPv4 address and share `http://YOUR-IP:4173`. Windows Firewall may ask for permission for Node on private networks.

## Response log

For local runs, the response file is `data/responses.csv`. It is written with a UTF-8 BOM and quoted fields so Excel can open long answers cleanly. It contains only a random response ID, UTC timestamp, and answers; no name, email, IP address, or user agent is recorded. The file is intentionally ignored by Git so local responses cannot be pushed accidentally.

For a protected browser download, set an admin key before starting the server:

```powershell
$env:ADMIN_KEY = "choose-a-long-private-key"
node tools/local-server.mjs
```

Then use `/admin/download?key=choose-a-long-private-key`. Do not share that URL publicly.

The local owner page is also available at `/admin`. It sends the key in an `X-Admin-Key` header and downloads the same CSV without putting the key in the URL.

## Vercel deployment

The repository includes Vercel Functions in `/api` and a `vercel.json` configuration. The build copies only the public HTML, CSS, and JavaScript into the Vercel static output; local data and server tooling are not served by the deployed site. Submissions are stored as private JSON blobs in Vercel Blob. The owner export endpoint combines those records into an Excel-compatible CSV.

1. In the Vercel project, open **Storage → Create Database → Blob**.
2. Choose **Private** storage and connect the store to the `primary-research` project for Production (and Preview if needed). Vercel will provide the Blob environment variables to the project.
3. Add a long random `ADMIN_KEY` environment variable in Vercel for Production.
4. Redeploy the project from GitHub.
5. Open `/admin`, enter the key, and download the CSV. It can be opened directly in Excel.

The Blob store is intentionally private; respondents only receive a success response, and the export route is protected by `ADMIN_KEY`. Do not put `ADMIN_KEY` or any Blob token in the repository.

The supplied `data/questionnaire_responses_template.xlsx` is a formatted Excel starter workbook with a response-log sheet and a question map. You can use it to analyse the downloaded CSV after gathering responses.

## Question design note

The source image skips from question 14 to 16. The final prompt is labelled 15 in this form so the questionnaire has a continuous sequence. Yes/no wording was converted into open prompts so respondents can explain their experience.
