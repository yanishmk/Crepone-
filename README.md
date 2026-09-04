This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Stripe checkout

Le panier utilise maintenant Stripe Checkout:

1. Le client clique sur `Payer par carte`.
2. Le site cree une session Stripe via `POST /api/checkout`.
3. Stripe utilise l'email client pour le recu de paiement.
4. Stripe confirme le paiement sur `POST /api/stripe/webhook`.
5. Seulement apres paiement confirme, le site envoie la commande au hub Cluster POS avec `paymentStatus: paid_externally`.

Le webhook est compatible Vercel/serverless: il reconstruit la commande depuis
la session Stripe payee et les line items Stripe, puis recalcule les prix/UID
POS depuis `data/menu.json`. L'ancien endpoint direct `POST /api/order` est
desactive par defaut pour eviter les commandes non payees; l'activer seulement
avec `ENABLE_PAY_AT_POS_ORDERS=true`.

Variables a ajouter dans `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3001
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLUSTER_HUB_URL=http://localhost:3000
CLUSTER_HUB_WEBSITE_API_KEY=...
ENABLE_PAY_AT_POS_ORDERS=false
```

En local, lancer le webhook Stripe:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Puis utiliser le `whsec_...` affiche par Stripe CLI comme `STRIPE_WEBHOOK_SECRET`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
