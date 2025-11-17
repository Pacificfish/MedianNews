# Next Steps for Median News

## ✅ Completed
- [x] Project setup (Next.js, TypeScript, TailwindCSS)
- [x] Database schema and RLS policies
- [x] Core pages (home, analyze, topic, profile, auth, billing)
- [x] URL analyzer with OpenAI bias classification
- [x] UI components (bias bar, story cards, etc.)
- [x] Supabase integration
- [x] Basic authentication

## 🚀 Immediate Next Steps

### 1. **Test RSS Ingestion** (Priority: High)
   - **Goal**: Get articles flowing into the database
   - **Steps**:
     ```bash
     # Test the ingestion endpoint manually
     curl -X GET http://localhost:3000/api/ingest \
       -H "Authorization: Bearer local_dev_secret"
     ```
   - **Check**: Verify articles appear in Supabase `articles` table
   - **Verify**: Topics are being created in `topics` table
   - **Note**: You may need to enable the `pgvector` extension in Supabase for embeddings

### 2. **Set Up Vercel Cron Jobs** (Priority: High)
   - **Goal**: Automate article ingestion and ranking
   - **Steps**:
     1. Push code to GitHub
     2. Deploy to Vercel
     3. Add environment variables in Vercel dashboard
     4. Cron jobs will auto-detect from `vercel.json`
     5. Set up cron secrets in Vercel environment variables
   - **Cron Schedule**:
     - Ingestion: Every 5 minutes (`*/5 * * * *`)
     - Ranking: Every 2 minutes (`*/2 * * * *`)

### 3. **Complete Stripe Integration** (Priority: Medium)
   - **Goal**: Enable Pro tier subscriptions
   - **Steps**:
     1. Create products in Stripe Dashboard
     2. Set up webhook endpoint: `/api/webhooks/stripe`
     3. Add `STRIPE_WEBHOOK_SECRET` to environment variables
     4. Test checkout flow
     5. Implement rate limiting for free tier (10 analyses/day)

### 4. **Add Rate Limiting** (Priority: Medium)
   - **Goal**: Enforce free tier limits
   - **Location**: `/app/api/analyze/route.ts`
   - **Implementation**:
     - Check user's subscription status
     - Track daily analysis count per user
     - Return 429 error when limit reached
     - Show "Upgrade to Pro" message

### 5. **Improve Topic Clustering** (Priority: Medium)
   - **Goal**: Better grouping of related articles
   - **Current**: Basic clustering logic
   - **Enhancements**:
     - Use OpenAI embeddings for better similarity
     - Implement incremental clustering algorithm
     - Add topic title generation from articles
     - Improve side assignment (Left/Center/Right)

### 6. **Add More News Sources** (Priority: Low)
   - **Goal**: Increase coverage diversity
   - **Steps**:
     - Use admin panel at `/admin/sources`
     - Or update `scripts/seed-sources.sql`
     - Verify RSS feeds are active and valid
   - **Target**: 100+ sources across all biases

## 🎨 UI/UX Improvements

### 7. **Homepage Enhancements**
   - Add loading states
   - Add "Load More" pagination
   - Add filters (by date, bias, topic)
   - Add search functionality

### 8. **Compare Mode Improvements**
   - Add "Share" button with OG image
   - Improve AI summary quality
   - Add article preview on hover
   - Add "View Full Article" links

### 9. **Profile Dashboard**
   - Add reading recommendations
   - Add "Balance tips" with AI suggestions
   - Add reading history timeline
   - Add export data feature

## 🔧 Technical Improvements

### 10. **Error Handling & Monitoring**
   - Add error logging (Sentry or similar)
   - Add analytics tracking
   - Monitor API usage and costs
   - Set up alerts for ingestion failures

### 11. **Performance Optimization**
   - Add caching for analyzed articles
   - Optimize database queries
   - Add image optimization
   - Implement ISR for topic pages

### 12. **SEO & Sharing**
   - Verify OG images work correctly
   - Add structured data (JSON-LD)
   - Improve meta descriptions
   - Add sitemap generation

## 📊 Testing & Quality

### 13. **Testing**
   - Test all user flows
   - Test edge cases (invalid URLs, API failures)
   - Test subscription flow
   - Test admin panel functionality

### 14. **Data Quality**
   - Verify bias classifications are accurate
   - Review topic clustering quality
   - Check for duplicate articles
   - Monitor source freshness

## 🚢 Deployment Checklist

### 15. **Pre-Launch**
   - [ ] All environment variables set
   - [ ] Database backups configured
   - [ ] Stripe webhooks tested
   - [ ] Cron jobs running
   - [ ] Error monitoring set up
   - [ ] Analytics configured
   - [ ] Legal pages (Privacy, Terms)
   - [ ] Contact/support page

### 16. **Launch**
   - [ ] Deploy to production
   - [ ] Test all features in production
   - [ ] Monitor for issues
   - [ ] Share with beta users
   - [ ] Gather feedback

## 📈 Post-Launch

### 17. **Growth & Features**
   - Add email newsletters
   - Add social sharing
   - Add browser extension
   - Add mobile app (optional)
   - Add API for developers

### 18. **Monetization**
   - Optimize Pro tier pricing
   - Add team/organization plans
   - Consider affiliate partnerships
   - Add premium features

## 🐛 Known Issues to Address

1. **Vector Extension**: May need to enable `pgvector` in Supabase for embeddings
2. **Admin Role Check**: Currently allows any logged-in user to access admin
3. **Rate Limiting**: Not yet implemented for free tier
4. **Error Messages**: Could be more user-friendly
5. **Loading States**: Some pages lack loading indicators

## 📝 Quick Commands

```bash
# Run development server
npm run dev

# Test ingestion locally
curl -X GET http://localhost:3000/api/ingest \
  -H "Authorization: Bearer local_dev_secret"

# Check database
# Go to Supabase Dashboard > Table Editor

# View logs
# Check Vercel dashboard or terminal output
```

## 🎯 Recommended Order

1. **Week 1**: Test ingestion → Set up cron jobs → Deploy to Vercel
2. **Week 2**: Complete Stripe → Add rate limiting → Test end-to-end
3. **Week 3**: UI improvements → Error handling → SEO
4. **Week 4**: Testing → Launch prep → Beta launch

---

**Need help with any of these?** Let me know which step you'd like to tackle next!

