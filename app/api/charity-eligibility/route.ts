import { NextRequest, NextResponse } from 'next/server';
import charityProgramsData from '@/data/charityPrograms.json';
import { analyzeCharityEligibility } from '@/lib/utils';
import { CharityEligibilityRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestData: CharityEligibilityRequest = body;

    if (!requestData.householdIncome || !requestData.familySize || !requestData.employmentStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get charity programs
    const programs = charityProgramsData as any[];

    // Analyze eligibility using AI-powered function
    const result = analyzeCharityEligibility(requestData, programs);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Charity eligibility error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

