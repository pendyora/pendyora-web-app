# "Notify me" setup: free, no server

The coming-soon page is a plain HTML file. The email box can send sign-ups straight to a **Google Form**, and the Form saves them in a **Google Sheet**. You don't need a server, a database or a paid plan.

## 1. Create the form (5 minutes)
1. Go to https://forms.google.com and create a blank form named **DazzBliss early access**.
2. Add one **Short answer** question called **Email**. Optional: under ⋮ → *Response validation*, choose *Text → Email*.
3. In **Settings → Responses**, make sure **"Limit to 1 response"** and **"Collect email addresses"** are both **off**. If either is on, people have to sign in to Google, and the page can't submit for them.
4. Click **Publish** (top right) and keep **Responders: Anyone with the link**. The form won't accept answers until it's published.
5. In the **Responses** tab, click **Link to Sheets**. Every sign-up now lands in a spreadsheet.

## 2. Get the two values the page needs
1. Click ⋮ → **Get pre-filled link**, type `test@test.com` in the Email field, then click **Get link → Copy link**.
2. The copied link looks like this:
   `https://docs.google.com/forms/d/e/1FAIpQLSxxxx/viewform?usp=pp_url&entry.1234567890=test@test.com`
   - **action**: the part before `?`, with `viewform` changed to `formResponse`
     → `https://docs.google.com/forms/d/e/1FAIpQLSxxxx/formResponse`
   - **emailField**: the `entry.…` part → `entry.1234567890`

## 3. Paste them into the page
In `index.html`, find `const NOTIFY = {` near the bottom and fill in both values:

```js
const NOTIFY = {
  action: 'https://docs.google.com/forms/d/e/1FAIpQLSxxxx/formResponse',
  emailField: 'entry.1234567890'
};
```

Open the page, submit a test email, and check that it appears in the Sheet.

## 4. On launch day
Export the email column from the Sheet. Send the announcement from Gmail (with BCC, for small lists), or import the list into a free email tool such as Mailchimp or Brevo for a designed launch email.

## Hosting the page itself (also free)
The page is static, so it can go live free on Vercel, Netlify or GitHub Pages. Drop the `coming-soon` folder in, then point the dazzbliss.com domain at it.

## Notes
- Google does not report back whether a submission succeeded, so the page always shows the thank-you message. Run one test after setup.
- Never put a password or API key in the page. The Form link is fine to expose, because anyone could submit the public form anyway.
