# OddajKase 💸

> A React-based expense sharing dashboard — track who owes what, split costs, and settle up easily.

🌐 **Live app:** [oddaj-kase.vercel.app](https://oddaj-kase.vercel.app/)  
🎨 **Figma design:** [Expense Dashboard with Modal](https://www.figma.com/design/bR6ebiYDg9SBekyvRQFkID/Expense-Dashboard-with-Modal)

---

## Tech Stack

- **React** (Vite) — component-based UI with fast HMR
- **Firebase** — authentication (email/password + Google OAuth) and data storage
- **Google Analytics** — usage tracking via `VITE_GA_MEASUREMENT_ID`
- Deployed on **Vercel**

---

## Getting Started

### 1. Install dependencies

```bash
npm i
```

### 2. Set up environment variables

Copy the example env file and fill in your Firebase project credentials:

```bash
cp .example.env .env
```

Required variables in `.env`:

| Variable                            | Description                     |
| ----------------------------------- | ------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase API key                |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain            |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID             |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket         |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID    |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID                 |
| `VITE_GA_MEASUREMENT_ID`            | Google Analytics measurement ID |

### 3. Start the development server

```bash
npm run dev
```

---

## Features & Usage Guide

### Login

Unauthenticated users are redirected to the login page.

![Login page](readme_images/image.png)

You can sign in with an existing account, register a new one, or use **Sign in with Google**.

---

### Dashboard

After logging in, you land on the main dashboard.

![Dashboard page](readme_images/image-2.png)

The dashboard shows:

- Your **overall balance**
- How much **others owe you**
- How much **you owe** others

Click any card to drill into the details.

#### Balance details

![Balance details](readme_images/image-3.png)

#### What you owe

![You owe details](readme_images/image-5.png)

#### What others owe you

![Owed to you details](readme_images/image-4.png)

---

### Groups

Click **Groups** in the sidebar to manage your expense groups.

![Groups page](readme_images/image-6.png)

From the Groups page you can:

- **Join a group** by entering a group code

  ![Join group modal](readme_images/image-7.png)

- **Create a new group**

  ![Add group modal](readme_images/image-8.png)

- **View group details** by clicking on any group card

  ![Group details](readme_images/image-9.png)

#### Inside a group

Each group has four tabs:

**Balance** — see who owes what within the group  
![Group balance](readme_images/image-10.png)

**Expenses** — all expenses recorded for the group  
![Group expenses](readme_images/image-11.png)

**Payments** — payment history  
![Group payments](readme_images/image-12.png)

**Settle up** — suggested settlements to clear balances  
![Group settle up](readme_images/image-13.png)

---

### Marking Payments as Settled

You can mark payments as settled from two places:

- **Dashboard** — click the "Owed to you" or "You owe" card
- **Group details** — go to the **Settle up** tab inside any group

To mark a debt as paid from the Dashboard, click the **"Owed to you"** card. Click **Mark as paid**, then confirm.

![Mark owed to you as paid](readme_images/image-15.png)

The balance updates immediately and the card reflects the new state.

The same flow works in reverse for the **"You owe"** card.

![Mark you owe as paid](readme_images/image-17.png)

---

### Adding an Expense

Click **New Expense** in the sidebar to open the expense form.

![Add expense modal](readme_images/image-18.png)

Fill in:

- **Name** — what the expense was for
- **Amount** — total cost
- **Category** — type of expense
- **Group** — which group to assign it to
- **Paid by** — who paid upfront

Then choose how to split:

**Equal split** — divided evenly among participants  
**By amount** — specify exact amounts per person  
![Split by amount](readme_images/image-19.png)

**By percentage** — specify each person's share as a percentage  
![Split by percentage](readme_images/image-20.png)

Click **Save expense** to confirm.

The expense then appears on the dashboard...

![Expense on dashboard](readme_images/image-21.png)

...and in the group's expense list.

![Expense in group](readme_images/image-22.png)
