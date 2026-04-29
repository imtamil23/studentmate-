export interface Document {
  id: string;
  name: string;
  type: 'Aadhaar' | 'Marksheet' | 'Income Certificate' | 'Other';
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  url?: string;
  path?: string;
}

export interface UserProfile {
  // Personal and Contact Details
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  mobile: string;
  email: string; // Professional email
  currentAddress: string;
  permanentAddress: string;
  domicileState: string;
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  
  // Academic Information
  academicRecords: {
    class10: { rollNo: string; marks: number; percentage: number; year: string };
    class12: { rollNo: string; marks: number; percentage: number; year: string };
  };
  currentCourse: {
    institution: string;
    courseName: string;
    mode: 'Regular' | 'Distance';
    currentYear: string;
    semester: string;
    admissionNo: string;
  };
  competitiveExams: {
    name: string;
    score: string;
    rank?: string;
  }[];

  // Financial and Socio-Economic Data
  parentalIncome: number;
  parentalProfession: string;
  livingStatus: 'Hosteller' | 'Day Scholar';
  isDisabled: boolean;
  disabilityDetails?: string;
  avatarUrl?: string;

  // Legacy/Internal fields (keeping for compatibility during transition if needed)
  age?: number;
  education?: string;
  marks?: number;
  income?: number;
  skills?: string[];
  interests?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  badges: string[];
  documents: Document[];
  profile: UserProfile;
  phone?: string;
}

export interface Scholarship {
  id: string;
  title: string;
  description: string;
  amount: number;
  eligibility: {
    marks: number;
    income: number;
    caste?: string[];
    education?: string[];
  };
  course: string[];
  deadline: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  userId: string;
  status: 'pending' | 'prototype' | 'funding' | 'completed';
  createdAt: string;
}

export interface Subsidy {
  id: string;
  title: string;
  description: string;
  category: string;
  benefit: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'scholarship' | 'project' | 'subsidy' | 'system';
  isRead: boolean;
  createdAt: string;
}
