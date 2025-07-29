# Employment Process and Salary Negotiation System

## Overview
The Househelp App facilitates a structured employment process between Helpers and Households, with a built-in salary negotiation system that ensures fair compensation agreements.

## Process Flow

### 1. Helper Profile Setup
- Helpers create their profiles with skills, experience, and **Expected Monthly Salary**
- The expected salary serves as the starting point for negotiations
- This amount is clearly marked as "subject to negotiation"

### 2. Household Browsing and Matching
- Households browse helper profiles and can see their expected salaries
- Households can send match requests to helpers they're interested in
- Helpers can accept or reject match requests

### 3. Initial Match Acceptance
- When both parties accept a match, they can begin communication
- The salary negotiation process becomes available for accepted matches

### 4. Salary Negotiation Process

#### For Households:
1. **View Helper's Expected Salary**: See the helper's initial salary expectation
2. **Make Counter Offer**: If the expected salary doesn't match their budget, households can make a counter offer
3. **Negotiation History**: Track all offers and counter-offers in the negotiation history
4. **Final Agreement**: Once both parties agree, the salary is finalized

#### For Helpers:
1. **Receive Offers**: Get notifications when households make salary offers
2. **Accept or Reject**: Choose to accept the offered amount or make a counter-offer
3. **Counter Negotiation**: Propose a different amount if the household's offer is too low
4. **Final Agreement**: Confirm the final agreed salary

### 5. Negotiation States

The salary negotiation system supports the following states:
- **Pending**: Initial state when negotiation starts
- **Helper Counter**: Helper has made a counter-offer
- **Household Counter**: Household has made a counter-offer
- **Agreed**: Both parties have agreed on a final salary
- **Rejected**: One party has rejected the negotiation

### 6. Employment Finalization
- Once salary is agreed upon, both parties can proceed with employment
- The agreed salary becomes the official compensation
- Further communication can happen through the messaging system

## Key Features

### Transparency
- All salary expectations and offers are clearly visible to both parties
- Complete negotiation history is maintained for reference

### Flexibility
- Multiple rounds of negotiation are supported
- Either party can make counter-offers
- No pressure to accept the first offer

### Fair Process
- Both helpers and households have equal opportunity to negotiate
- Clear status indicators show the current state of negotiations
- Professional framework for salary discussions

## Technical Implementation

### Database Schema
- `helper_profiles.expected_salary`: Stores helper's expected monthly salary
- `salary_negotiations` table: Manages all negotiation data including:
  - Match and user IDs
  - Helper's expected salary
  - Household's offered salary
  - Final agreed salary
  - Negotiation status and history

### User Interface
- **Profile Setup**: Expected salary input for helpers
- **Dashboard**: Salary negotiation component for accepted matches
- **Real-time Updates**: Immediate notification of offers and counter-offers
- **History Tracking**: Complete record of all negotiation steps

### Security
- Row Level Security (RLS) ensures users can only access their own negotiations
- Admin oversight capabilities for dispute resolution
- Secure data handling for all financial information

## Benefits

### For Helpers
- Set realistic salary expectations upfront
- Negotiate fairly with potential employers
- Maintain professional standards for compensation
- Track all offers and negotiations

### For Households
- Understand helper's salary expectations before matching
- Negotiate within their budget constraints
- Make informed decisions about employment costs
- Maintain transparent communication about compensation

### For the Platform
- Reduces misunderstandings about compensation
- Facilitates professional employment relationships
- Provides data insights for market salary trends
- Ensures user satisfaction through fair processes

## Best Practices

### For Helpers
1. Research market rates before setting expected salary
2. Be open to reasonable negotiations
3. Consider the full employment package (accommodation, benefits, etc.)
4. Communicate professionally during negotiations

### For Households
1. Review helper's experience and skills when evaluating salary
2. Consider local market rates for domestic help
3. Be transparent about budget constraints
4. Respect the helper's professional worth

### For Both Parties
1. Keep negotiations respectful and professional
2. Be clear about expectations and constraints
3. Use the messaging system for detailed discussions
4. Finalize agreements promptly once terms are acceptable

This system ensures a fair, transparent, and professional approach to domestic employment, benefiting both helpers seeking fair compensation and households looking for quality domestic assistance.