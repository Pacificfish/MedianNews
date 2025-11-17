#!/bin/bash

# Test script for RSS ingestion
# This will manually trigger the ingestion endpoint

echo "Testing RSS Ingestion..."
echo ""

# Get the CRON_SECRET from .env.local or use default
CRON_SECRET=${CRON_SECRET:-"local_dev_secret"}

# Make the API call
curl -X GET http://localhost:3000/api/ingest \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -v

echo ""
echo ""
echo "Check your Supabase dashboard to see if articles were created!"

