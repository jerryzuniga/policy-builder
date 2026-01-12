import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Book, 
  Shield, 
  Users, 
  Target, 
  Filter, 
  Activity, 
  Briefcase, 
  BarChart2, 
  CheckCircle, 
  Download, 
  ChevronRight, 
  Info, 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  ClipboardCheck, 
  Menu, 
  X, 
  User, 
  CheckSquare, 
  ExternalLink, 
  AlertTriangle, 
  HardHat, 
  DollarSign, 
  Hammer, 
  Home, 
  ArrowRight, 
  AlertCircle, 
  Clipboard
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// --- Types & Interfaces ---

interface Step {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
}

interface StaffMember {
  id: number;
  name: string;
  title: string;
}

interface PolicyMapEntry {
  org: boolean;
  program: boolean;
  programDetails: string;
}

interface Role {
  id: number;
  title: string;
  responsibilities: string;
  approves: string[];
}

interface Stage {
  id: number;
  name: string;
  reqDoc: string;
}

interface VulnerableGroup {
  key: string;
  label: string;
  reason: string;
}

interface RequiredTopic {
  key: string;
  label: string;
}

interface ManualData {
  orgName: string;
  orgAddress: string;
  orgPhone: string;
  orgEmail: string;
  serviceArea: string;
  existingPolicies: string;
  staff: StaffMember[];
  policyMap: Record<string, PolicyMapEntry>;
  policyPackage: {
    exists: boolean;
    coveredTopics: Record<string, boolean>;
    topicContent: Record<string, string>;
  };
  policy33Aligned: boolean;
  policy33Checklist: Record<string, boolean>;
  repairsAOMReviewed: boolean;
  governance: {
    approvalDate: string;
    policyVersion: string;
    lastReviewDate: string;
    nextReviewDate: string;
    storageLocation: string;
    approverRole: string;
    resolutionReference: string;
  };
  roles: Role[];
  repairTypes: Record<string, boolean>;
  financialCap: number | string;
  exclusions: string;
  intakeMethods: Record<string, boolean>;
  priorityFactors: Record<string, number>;
  projectFeasibility: {
    assessmentProtocol: string;
    selectionAuthority: string;
    selectionArtifact: string;
    feasibilityLimits: string;
  };
  clientServices: {
    stages: Stage[];
    participation: {
      required: string;
      options: string;
      documentation: string;
    };
  };
  stages: Stage[]; // Kept for legacy compatibility if needed
  participation: {
    required: string;
    options: string;
    documentation: string;
  };
  model: string;
  qcFrequency: string;
  procurement: {
    selectionMethod: string;
    minQualifications: string;
    requiredDocs: Record<string, boolean>;
  };
  volunteerStandards: {
    allowedScopes: string;
    supervision: string;
    training: string;
  };
  safety: {
    riskScreening: string;
    safetyPlan: string;
    specialtyContractorTriggers: string;
  };
  kpis: Record<string, boolean>;
  reportingSchedule: string;
  feedbackMechanism: string;
  sustainability: {
    fundingMix: string;
    costControls: string;
    pipelineTargets: string;
  };
  constructionActivities: {
    hasCatalog: boolean | null;
    eligibleScopes: string;
    ineligibleScopes: string;
    permitTriggers: string;
  };
  pricing: {
    modelType: string;
    calculationMethod: string;
    repaymentTerms: string;
    hardshipPolicy: string;
  };
  version?: string;
  lastUpdated?: string;
}

interface StepProps {
  data: ManualData;
  onChange: (field: keyof ManualData, value: any) => void;
}

// --- Constants ---

const APP_VERSION = '1.7.8.1';
const STORAGE_KEY = 'repair_manual_data_v1';
const BRAND_COLOR = '#6C64DD'; // Updated Purple/Indigo
const BRAND_COLOR_DARK = '#564FCC'; // Darker shade for hover/interactions
const LOGO_URL = 'https://github.com/jerryzuniga/Preservation/blob/ce11cf49a7ae9130b7763e2de2d66cdcdf9d82ad/public/policy.png?raw=true';

const STEPS: Step[] = [
  { id: 'foundations', title: 'Setup', icon: Book, description: 'Org details and Key Staff' },
  { id: 'policyMap', title: 'Policy Map', icon: Shield, description: 'Distinguish Org vs. Program policies' },
  { id: 'programModel', title: 'Roles/Responsibilities', icon: Users, description: 'Define staff and board roles' },
  { id: 'scope', title: 'Scope & Impact', icon: Target, description: 'Eligibility, caps, and exclusions' },
  { id: 'clientServices', title: 'Client Services', icon: Clipboard, description: 'Service flow and participation' },
  { id: 'screening', title: 'Prioritization', icon: Filter, description: 'Intake and scoring matrix' },
  { id: 'lifecycle', title: 'Project Lifecycle', icon: Activity, description: 'Assessment to Closeout' },
  { id: 'workforce', title: 'Workforce Strategy', icon: Briefcase, description: 'Contractors vs. Volunteers' },
  { id: 'performance', title: 'Performance', icon: BarChart2, description: 'KPIs and Reporting' },
  { id: 'compliance', title: 'Compliance', icon: CheckSquare, description: 'Policy 33 Alignment' },
  { id: 'export', title: 'Review & Export', icon: ClipboardCheck, description: 'Finalize and download' },
];

const VULNERABLE_GROUPS: VulnerableGroup[] = [
  { key: 'lmiHouseholds', label: 'LMI Households (≤80% AMI)', reason: 'Core target for HUD/funding; risk of deferred maintenance' },
  { key: 'olderAdults', label: 'Older Adults (62+)', reason: 'Aging in place, fall risk, fixed income' },
  { key: 'disabilities', label: 'People with Disabilities', reason: 'High ADL challenges, modification needs' },
  { key: 'veterans', label: 'Veterans', reason: 'Displacement risk, targeted outreach needs' },
  { key: 'raciallyMarginalized', label: 'Racially Marginalized Communities', reason: 'Historic disinvestment/redlining' },
  { key: 'persistentPoverty', label: 'Persistent Poverty / Distressed', reason: 'Chronic disinvestment, economic hardship' },
  { key: 'femaleHead', label: 'Female Head of Household', reason: 'Historical income disparity' },
  { key: 'largeFamilies', label: 'Large Families (5+ members)', reason: 'Overcrowding, systems stress' },
  { key: 'mobileHomeowners', label: 'Manufactured/Mobile Homeowners', reason: 'High substandard rates, energy burden' },
  { key: 'ruralHouseholds', label: 'Rural Households', reason: 'Limited funding, workforce challenges' },
  { key: 'disasterImpacted', label: 'Disaster-Impacted', reason: 'Structural damage, immediate displacement risk' }
];

const REQUIRED_TOPICS_2_1_1: RequiredTopic[] = [
  { key: 'assessment', label: 'Project assessment and selection criteria' },
  { key: 'partnerSelection', label: 'Repair partner selection criteria & process' },
  { key: 'participation', label: 'Owner and household member participation' },
  { key: 'staffing', label: 'Staffing and volunteer participation' },
  { key: 'pricing', label: 'Pricing and repayment model' },
  { key: 'constructionTypes', label: 'Types of construction activities' },
  { key: 'sustainability', label: 'Financial sustainability' },
  { key: 'risk', label: 'Risk management' },
  { key: 'safety', label: 'Safety' }
];

const INITIAL_DATA: ManualData = {
  // Foundations
  orgName: '',
  orgAddress: '',
  orgPhone: '',
  orgEmail: '',
  serviceArea: '',
  existingPolicies: '', 
  staff: [
    { id: 1, name: '', title: 'Executive Director' },
    { id: 2, name: '', title: 'Program Manager' },
    { id: 3, name: '', title: 'Board Champion' }
  ],
  
  // Step 2: Policy Map
  policyMap: {
    governance: { org: false, program: false, programDetails: '' },
    finance: { org: false, program: false, programDetails: '' },
    hr: { org: false, program: false, programDetails: '' },
    eligibility: { org: false, program: false, programDetails: '' },
    safety: { org: false, program: false, programDetails: '' },
    procurement: { org: false, program: false, programDetails: '' },
    recordKeeping: { org: false, program: false, programDetails: '' }
  },
  policyPackage: {
    exists: false,
    coveredTopics: {},
    topicContent: {} 
  },

  // Step 9: Compliance
  policy33Aligned: false,
  policy33Checklist: {
    codes: false,
    agreements: false,
    consumerProtection: false,
    lendingCompliance: false,
    subcontractorOversight: false,
    insurance: false
  },
  repairsAOMReviewed: false,
  
  governance: {
    approvalDate: '',
    policyVersion: '1.0',
    lastReviewDate: '',
    nextReviewDate: '',
    storageLocation: '',
    approverRole: 'Board of Directors',
    resolutionReference: ''
  },

  // Program Model
  roles: [
    { id: 1, title: 'Program Manager', responsibilities: 'Overall execution, compliance, reporting', approves: ['SOW', 'Closeout'] },
    { id: 2, title: 'Intake Coordinator', responsibilities: 'Client screening, document collection', approves: ['Eligibility'] },
    { id: 3, title: 'Construction Lead', responsibilities: 'Scoping, QC, Contractor management', approves: ['Change Order'] }
  ],

  // Scope
  repairTypes: {
    critical: true,
    accessibility: false,
    energy: false,
    exterior: false
  },
  financialCap: 15000,
  exclusions: '',

  // Client Screening
  intakeMethods: { phone: true, web: false, walkin: false },
  priorityFactors: {
    healthSafety: 5,
    lmiHouseholds: 3,
    olderAdults: 3
  },
  projectFeasibility: {
    assessmentProtocol: 'internal',
    selectionAuthority: 'Program Manager',
    selectionArtifact: 'Scoring Matrix',
    feasibilityLimits: ''
  },
  
  // Client Services
  clientServices: {
    stages: [
        { id: 1, name: 'Inquiry & App', reqDoc: 'Application Form' },
        { id: 2, name: 'Eligibility Review', reqDoc: 'Income Verification' },
        { id: 3, name: 'Home Assessment', reqDoc: 'Inspection Report' },
        { id: 4, name: 'SOW & Approval', reqDoc: 'Signed Agreement' },
        { id: 5, name: 'Construction', reqDoc: 'Permits' },
        { id: 6, name: 'Closeout', reqDoc: 'Satisfaction Survey' }
    ],
    participation: {
        required: '', 
        options: 'Sweat equity hours, Provide lunch, Site cleanup',
        documentation: 'Partner Agreement Clause 4.1'
    }
  },

  // Lifecycle
  stages: [
    { id: 1, name: 'Inquiry & App', reqDoc: 'Application Form' },
    { id: 2, name: 'Eligibility Review', reqDoc: 'Income Verification' },
    { id: 3, name: 'Home Assessment', reqDoc: 'Inspection Report' },
    { id: 4, name: 'SOW & Approval', reqDoc: 'Signed Agreement' },
    { id: 5, name: 'Construction', reqDoc: 'Permits' },
    { id: 6, name: 'Closeout', reqDoc: 'Satisfaction Survey' }
  ],
  participation: {
    required: 'required',
    options: 'Sweat equity hours, Provide lunch, Site cleanup',
    documentation: 'Partner Agreement Clause 4.1'
  },

  // Workforce
  model: 'blended',
  qcFrequency: 'milestone',
  procurement: {
    selectionMethod: 'Preferred Vendor List', 
    minQualifications: 'State License, General Liability Insurance ($1M)',
    requiredDocs: { w9: true, coi: true, bonding: false, warranty: true }
  },
  volunteerStandards: {
    allowedScopes: 'Painting, Landscaping, Demolition (non-structural)',
    supervision: 'HFH Site Supervisor must be present at all times',
    training: 'Online Safety Course + On-site orientation'
  },
  safety: {
    riskScreening: 'Asbestos, Lead, Structural Integrity, Pet Safety',
    safetyPlan: 'Daily tailgate talks, PPE enforcement, Incident Reporting Log',
    specialtyContractorTriggers: 'Electrical, Plumbing, HVAC, Roofs > 1 story'
  },

  // Performance
  kpis: {
    homesServed: true,
    avgCost: true,
    repairTimeline: false,
    clientSatisfaction: true,
    safetyIncidents: false
  },
  reportingSchedule: 'monthly',
  feedbackMechanism: '',
  sustainability: {
    fundingMix: '40% Grants, 30% ReStore Profits, 30% Donations',
    costControls: 'Change orders >$500 require ED approval',
    pipelineTargets: '15 homes/year, Avg $10k/home'
  },

  // Meta
  version: '1.7.8.1',
  lastUpdated: new Date().toISOString(),
  constructionActivities: {
    hasCatalog: null, 
    eligibleScopes: '',
    ineligibleScopes: '',
    permitTriggers: ''
  },
  pricing: {
    modelType: 'grant', // grant, loan, hybrid, fee
    calculationMethod: 'Project Cost + 10% Admin',
    repaymentTerms: '0% interest, forgivable after 5 years',
    hardshipPolicy: 'Deferral available for medical emergencies'
  }
};

// --- Landing Page Component ---
const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg">
                <img src={LOGO_URL} alt="Policy Builder" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Policy<span style={{ color: BRAND_COLOR }}>Builder</span></span>
            </div>
            <button 
              onClick={onStart}
              className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Launch Builder
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-[#3c366b] text-xs font-semibold uppercase tracking-wide mb-6" style={{ backgroundColor: `${BRAND_COLOR}20` }}>
              New: Policy 33 Automation
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Build a Compliant Home Repair Manual <span style={{ color: BRAND_COLOR }}>in Minutes.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Stop starting from a blank page. The Policy Builder guides you through every step of creating a Board-ready Policy & Procedure manual, ensuring full alignment with U.S. Policy 33.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={onStart}
                className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white shadow-xl transition-all hover:-translate-y-1"
                style={{ backgroundColor: BRAND_COLOR }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND_COLOR_DARK}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = BRAND_COLOR}
              >
                Launch Builder
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <a href="#how-it-works" className="inline-flex justify-center items-center px-8 py-4 border border-slate-200 text-lg font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all">
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to launch safely</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Designed specifically for Habitat affiliates to navigate the complexities of repair programs without the administrative headache.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${BRAND_COLOR}20` }}>
                <CheckSquare className="w-6 h-6" style={{ color: BRAND_COLOR }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Policy 33 Compliance</h3>
              <p className="text-slate-600">Built-in checklists ensure you meet all 9 required topic areas, from 2.1.1 assessments to 2.1.8 insurance requirements.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Governance Mapping</h3>
              <p className="text-slate-600">Clearly distinguish between Board-level policies and Staff-level procedures to prevent governance bloat and improve agility.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Documentation</h3>
              <p className="text-slate-600">Export a professionally formatted, editable Microsoft Word document ready for your Board packet or grant application.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works (Stepper Preview) */}
      <div id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">A guided path to a better manual</h2>
              <p className="text-lg text-slate-600 mb-8">We've broken down the daunting task of manual writing into 10 logical, bite-sized steps.</p>
              
              <div className="space-y-6">
                {[
                  { title: 'Define Scope & Impact', desc: 'Set financial caps, eligible repairs, and pricing models.', icon: Target },
                  { title: 'Establish Workforce Strategy', desc: 'Decide how you will balance contractors vs. volunteers.', icon: Users },
                  { title: 'Automate Compliance', desc: 'Validate against Policy 33 requirements in real-time.', icon: CheckCircle }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <Icon className="w-6 h-6" style={{ color: BRAND_COLOR }} />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6C64DD] to-purple-600 rounded-2xl transform rotate-3 opacity-20 blur-xl"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
                <div className="space-y-4">
                   <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                   <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                   <div className="h-32 bg-[#6C64DD]/10 rounded-xl border border-[#6C64DD]/30 flex items-center justify-center text-[#6C64DD] font-medium">
                       Interactive Policy Builder Preview
                   </div>
                   <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to professionalize your repair program?</h2>
          <p className="text-slate-400 mb-10 text-lg">Join hundreds of affiliates using Policy Builder to standardize operations and reduce risk.</p>
          <button 
            onClick={onStart}
            className="inline-flex justify-center items-center px-8 py-4 text-white font-bold rounded-xl transition-all hover:scale-105"
            style={{ backgroundColor: BRAND_COLOR }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND_COLOR_DARK}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = BRAND_COLOR}
          >
            Launch Builder
            <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Guide Panel Component ---

const GuidePanel: React.FC<{ stepId: string }> = ({ stepId }) => {
  const guideContent: Record<string, { title: string; text: string; link?: string; linkText?: string }> = {
    foundations: { title: "Setting the Foundation", text: "Start by defining your organization's boundaries. Providing accurate contact details ensures that the exported manual is ready for distribution." },
    policyMap: { title: "Governance vs. Operations", text: "Policy 33 requires specific topics to be in a 'written, board-approved policy' (Sec 2.1.1). Use the 'Repair Program Policy Package' section to draft this policy language directly. Check a topic to open a text box for that section." },
    programModel: { title: "Roles & Responsibilities", text: "Avoid listing specific people. List roles. In smaller affiliates, one person might wear three hats. Explicitly define who has 'signing authority'." },
    scope: { title: "Pricing & Construction", text: "Policy 33 requires a defined 'Pricing and repayment model' and 'Types of construction activities'. Be specific about what you DON'T do (e.g., mold) to manage expectations." },
    clientServices: { title: "Sweat Equity", text: "There is no obligation for the affiliate to implement sweat equity for its repair program, nor is a minimum number of sweat-equity hours required. However, if sweat equity is enforced, affiliates must provide accessible participation for the homeowner, as appropriate. It is important to remember that repairs serve individuals who may be living at extremely low-income levels and/or experiencing severe mobility and social limitations. Safeguarding both the mental and physical well-being of those at the greatest level of need should be the baseline for how repair programming is implemented." },
    screening: { title: "Project Selection", text: "Define not just WHO you serve, but HOW you decide if a home is feasible. Define your 'Walk Away' criteria—when is a house too damaged?" },
    lifecycle: { title: "Participation (Sweat Equity)", text: "Policy 33 requires defined 'Owner participation requirements'. Will you require sweat equity? If so, what accommodations exist for seniors or those with disabilities?" },
    workforce: { title: "Risk & Procurement", text: "This is critical. Policy 33 requires 'Repair partner selection criteria' and 'Safety procedures'. Don't just check a box—list the actual insurance minimums and training rules." },
    performance: { title: "Sustainability", text: "Policy 33 mandates a 'Financial sustainability' plan. How are you funding this? What are your cost controls? Grant reporting often relies on the KPIs you select here." },
    compliance: { title: "Automating Compliance", text: "This section verifies your alignment with U.S. Policy 33. The 'Governance' fields allow you to generate a formal Compliance Declaration.", link: "https://hfhi.sharepoint.com/sites/ComplianceRequirements/Shared%20Documents/Policy%2033_Home_Repairs.pdf?csf=1&e=ZJK1Q9&CID=46dbe841-b4a0-4ae3-8d69-22a34d8cc56a", linkText: "View Policy 33 PDF" },
    export: { title: "Ready for Approval", text: "This export generates a draft for your Board or ED. It includes a version history log." }
  };

  const content = guideContent[stepId] || { title: "Guidance", text: "Follow the prompts to complete this section." };

  return (
    <div className="bg-white border-l border-gray-200 p-6 h-full shadow-sm flex flex-col">
      <div className="flex-1">
        <div className="flex items-center mb-4">
            <div className="p-2 rounded-full mr-3" style={{ backgroundColor: `${BRAND_COLOR}20` }}>
              {stepId === 'clientServices' ? <AlertCircle className="w-5 h-5" style={{ color: BRAND_COLOR }} /> : <Info className="w-5 h-5" style={{ color: BRAND_COLOR }} />}
            </div>
            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
              {stepId === 'clientServices' ? 'IMPORTANT' : 'Best Practices'}
            </h4>
        </div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: '#3c366b' }}>{content.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">{content.text}</p>
        {content.link && (
            <a href={content.link} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border rounded-lg text-sm font-medium transition-colors group" style={{ backgroundColor: `${BRAND_COLOR}10`, borderColor: `${BRAND_COLOR}30`, color: BRAND_COLOR_DARK }}>
            <FileText className="w-4 h-4 mr-2" />{content.linkText || "View Resource"}<ExternalLink className="w-3 h-3 ml-auto opacity-50 group-hover:opacity-100" />
            </a>
        )}
      </div>
    </div>
  );
};

// --- Step Components ---

const FoundationsStep: React.FC<StepProps> = ({ data, onChange }) => {
  const addStaff = () => {
    const newStaff = { id: Date.now(), name: '', title: '' };
    onChange('staff', [...(data.staff || []), newStaff]);
  };
  const updateStaff = (id: number, field: string, value: string) => {
    const updated = data.staff.map(s => s.id === id ? { ...s, [field]: value } : s);
    onChange('staff', updated);
  };
  const removeStaff = (id: number) => onChange('staff', data.staff.filter(s => s.id !== id));

  return (
    <div className="space-y-8 max-w-4xl">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">Organization Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Affiliate / Organization Name <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.orgName || ''} onChange={(e) => onChange('orgName', e.target.value)} placeholder="e.g. Habitat for Humanity of Springfield" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mailing Address <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.orgAddress || ''} onChange={(e) => onChange('orgAddress', e.target.value)} placeholder="e.g. 123 Main St, Springfield, IL 62704" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.orgPhone || ''} onChange={(e) => onChange('orgPhone', e.target.value)} placeholder="(555) 123-4567" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.orgEmail || ''} onChange={(e) => onChange('orgEmail', e.target.value)} placeholder="info@habitatspringfield.org" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service Area (Counties/Zips) <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.serviceArea || ''} onChange={(e) => onChange('serviceArea', e.target.value)} placeholder="e.g. Greene County and Northern Polk County" />
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center border-b pb-2"><User className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Key Staff Contacts</h4>
            <div className="space-y-3">
                {(data.staff || []).map((staff) => (
                    <div key={staff.id} className="flex gap-3 items-center">
                        <input type="text" className="flex-1 rounded-lg border-gray-300 shadow-sm p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={staff.name} onChange={(e) => updateStaff(staff.id, 'name', e.target.value)} placeholder="Full Name" />
                        <input type="text" className="flex-1 rounded-lg border-gray-300 shadow-sm p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={staff.title} onChange={(e) => updateStaff(staff.id, 'title', e.target.value)} placeholder="Job Title" />
                        <button onClick={() => removeStaff(staff.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                ))}
                <button onClick={addStaff} className="text-sm font-medium flex items-center mt-2" style={{ color: BRAND_COLOR }}><Plus className="h-4 w-4 mr-1" /> Add Staff Member</button>
            </div>
        </div>
    </div>
  );
};

const PolicyMapStep: React.FC<StepProps> = ({ data, onChange }) => {
  const updateMap = (key: string, field: keyof PolicyMapEntry, value: any) => {
    // If updating a boolean toggle
    const currentEntry = data.policyMap?.[key] || { org: false, program: false, programDetails: '' };
    onChange('policyMap', { 
        ...data.policyMap, 
        [key]: { ...currentEntry, [field]: value } 
    });
  };

  const updatePackage = (exists: boolean) => {
    onChange('policyPackage', { ...(data.policyPackage || {}), exists });
  };

  const toggleCoveredTopic = (topicKey: string) => {
    const newTopics = { 
        ...(data.policyPackage?.coveredTopics || {}), 
        [topicKey]: !data.policyPackage?.coveredTopics?.[topicKey] 
    };
    onChange('policyPackage', { ...(data.policyPackage || {}), coveredTopics: newTopics });
  };

  const updateTopicContent = (topicKey: string, value: string) => {
    const newContent = {
        ...(data.policyPackage?.topicContent || {}),
        [topicKey]: value
    };
    onChange('policyPackage', { ...(data.policyPackage || {}), topicContent: newContent });
  };

  const rows = [
    { key: 'governance', label: 'Governance & Board Structure' },
    { key: 'finance', label: 'Financial Management' },
    { key: 'hr', label: 'HR & Personnel' },
    { key: 'eligibility', label: 'Client Eligibility Criteria' },
    { key: 'safety', label: 'Worksite Safety' },
    { key: 'procurement', label: 'Contractor Procurement' },
    { key: 'recordKeeping', label: 'Record Keeping' },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 flex items-center">
                <FileText className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Repair Program Policy Package (2.1.1)
            </h3>
        </div>
        <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
                Policy 33 (Sec 2.1.1) requires a "written, board-approved policy" covering specific topics. 
                Select the topics below to open a text box where you can draft or paste your policy language.
            </p>
            
            <label className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer shadow-sm mb-6 ${data.policyPackage?.exists ? 'bg-[#6C64DD]/10 border-[#6C64DD]/20' : 'bg-white border-gray-200'}`}>
                <input
                    type="checkbox"
                    className="h-5 w-5 rounded focus:ring-[#6C64DD]"
                    style={{ color: BRAND_COLOR }}
                    checked={data.policyPackage?.exists || false}
                    onChange={(e) => updatePackage(e.target.checked)}
                />
                <span className="font-semibold text-gray-800">We have (or are drafting) a Board-Approved Repair Policy.</span>
            </label>

            {data.policyPackage?.exists && (
                <div className="animate-fadeIn space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Required Topics (Select to Edit)</h4>
                    <div className="space-y-3">
                        {REQUIRED_TOPICS_2_1_1.map(topic => {
                            const isChecked = data.policyPackage?.coveredTopics?.[topic.key] || false;
                            return (
                                <div key={topic.key} className={`border rounded-lg p-3 transition-all ${isChecked ? 'bg-[#6C64DD]/10 border-[#6C64DD]/20' : 'bg-white border-gray-200'}`}>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            className="rounded focus:ring-[#6C64DD] h-4 w-4"
                                            style={{ color: BRAND_COLOR }}
                                            checked={isChecked}
                                            onChange={() => toggleCoveredTopic(topic.key)}
                                        />
                                        <span className={`text-sm font-medium ${isChecked ? 'text-[#6961CC]' : 'text-gray-700'}`}>{topic.label}</span>
                                    </label>
                                    
                                    {isChecked && (
                                        <div className="mt-3 ml-7 animate-fadeIn">
                                            <textarea
                                                className="w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-[#6C64DD] focus:ring-[#6C64DD] p-2.5 border"
                                                rows={3}
                                                placeholder={`Enter policy text for ${topic.label}...`}
                                                value={data.policyPackage?.topicContent?.[topic.key] || ''}
                                                onChange={(e) => updateTopicContent(topic.key, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 flex items-center">
                <Shield className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Affiliate Policy Map
            </h3>
        </div>
        
        <div className="p-6 bg-white border-b border-gray-100">
            <p className="text-sm text-gray-600">
                Use checkboxes to indicate where each policy exists. In many cases, there may be both affiliate and program level policy for these topic areas.
            </p>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
            <tr>
                <th className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Category</th>
                <th className="px-3 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Org Level</th>
                <th className="px-3 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Program Level</th>
                <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((row) => {
                const entry = data.policyMap?.[row.key] || { org: false, program: false, programDetails: '' };
                const isOrg = entry.org;
                const isProgram = entry.program;
                const details = entry.programDetails || '';

                return (
                    <tr key={row.key} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 pl-6 pr-3 text-sm font-medium text-gray-900 align-top pt-5">{row.label}</td>
                        <td className="px-3 py-4 text-center align-top pt-5">
                            <input 
                                type="checkbox" 
                                className="h-5 w-5 rounded focus:ring-[#6C64DD]"
                                style={{ color: BRAND_COLOR }}
                                checked={isOrg} 
                                onChange={(e) => updateMap(row.key, 'org', e.target.checked)} 
                            />
                        </td>
                        <td className="px-3 py-4 text-center align-top pt-5">
                            <input 
                                type="checkbox" 
                                className="h-5 w-5 rounded focus:ring-[#6C64DD]"
                                style={{ color: BRAND_COLOR }}
                                checked={isProgram} 
                                onChange={(e) => updateMap(row.key, 'program', e.target.checked)} 
                            />
                        </td>
                        <td className="px-3 py-4 align-top">
                            {isProgram && (
                                <div className="animate-fadeIn">
                                    <textarea
                                        className="w-full text-xs rounded border-gray-300 shadow-sm focus:border-[#6C64DD] focus:ring-[#6C64DD] p-2 border"
                                        rows={2}
                                        placeholder={`Enter specific ${row.label} program policy details...`}
                                        value={details}
                                        onChange={(e) => updateMap(row.key, 'programDetails', e.target.value)}
                                    />
                                </div>
                            )}
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

const ProgramModelStep: React.FC<StepProps> = ({ data, onChange }) => {
  const addRole = () => {
    const newRole: Role = { id: Date.now(), title: 'New Role', responsibilities: '', approves: [] };
    onChange('roles', [...data.roles, newRole]);
  };

  const updateRole = (id: number, field: string, value: string) => {
    const updated = data.roles.map(r => r.id === id ? { ...r, [field]: value } : r);
    onChange('roles', updated);
  };

  const removeRole = (id: number) => {
    onChange('roles', data.roles.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4">
      {data.roles.map((role) => (
        <div key={role.id} className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-4 right-4">
            <button onClick={() => removeRole(role.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role Title</label>
              <input type="text" className="block w-full border-0 border-b-2 border-gray-100 focus:border-[#6C64DD] focus:ring-[#6C64DD] px-0 py-2 text-gray-900 font-medium placeholder-gray-300 transition-colors bg-transparent" value={role.title} onChange={(e) => updateRole(role.id, 'title', e.target.value)} placeholder="Enter title" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Key Responsibilities</label>
              <input type="text" className="block w-full border-0 border-b-2 border-gray-100 focus:border-[#6C64DD] focus:ring-[#6C64DD] px-0 py-2 text-gray-900 placeholder-gray-300 transition-colors bg-transparent" value={role.responsibilities} onChange={(e) => updateRole(role.id, 'responsibilities', e.target.value)} placeholder="Enter responsibilities" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addRole} className="w-full flex justify-center items-center py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-[#6C64DD] hover:text-[#6C64DD] hover:bg-[#6C64DD]/10 transition-all"><Plus className="h-5 w-5 mr-2" /> Add New Role</button>
    </div>
  );
};

const ScopeStep: React.FC<StepProps> = ({ data, onChange }) => {
  const updatePricing = (field: string, value: string) => onChange('pricing', { ...data.pricing, [field]: value });
  // Logic to handle catalog selection
  const setHasCatalog = (val: boolean) => onChange('constructionActivities', { ...data.constructionActivities, hasCatalog: val });
  
  return (
    <div className="space-y-8">
      {/* Pricing Model - Moved Up */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center"><DollarSign className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Pricing & Repayment Model</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pricing Model Type</label>
                <select className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.pricing?.modelType || 'grant'} onChange={(e) => updatePricing('modelType', e.target.value)}>
                    <option value="grant">Grant / No Cost</option>
                    <option value="loan">Loan / Repayment</option>
                    <option value="hybrid">Hybrid (Grant + Loan)</option>
                    <option value="fee">Fee for Service</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Calculation Method</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.pricing?.calculationMethod || ''} onChange={(e) => updatePricing('calculationMethod', e.target.value)} placeholder="e.g. Materials + Labor + 15%" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Repayment Terms & Hardship Policy</label>
                <textarea className="block w-full rounded-lg border-gray-300 p-2.5 border h-20 focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.pricing?.repaymentTerms || ''} onChange={(e) => updatePricing('repaymentTerms', e.target.value)} placeholder="e.g. 0% interest, forgivable lien. Hardship deferrals available." />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Financial Cap per Project ($)</label>
                <input type="number" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.financialCap} onChange={(e) => onChange('financialCap', e.target.value)} />
            </div>
        </div>
      </div>

      {/* Construction Activities - Simplified & Moved Down */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center"><Hammer className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Construction Activities</h4>
        <div className="space-y-4">
             <label className="block text-sm font-medium text-gray-700">
                Have you generated a comprehensive construction activities list using the Catalog Builder?
             </label>
             <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                    <input 
                        type="radio" 
                        name="hasCatalog" 
                        checked={data.constructionActivities?.hasCatalog === true} 
                        onChange={() => setHasCatalog(true)} 
                        className="h-4 w-4 border-gray-300 focus:ring-[#6C64DD]"
                        style={{ color: BRAND_COLOR }}
                    />
                    <span className="ml-2 text-sm text-gray-900">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer">
                    <input 
                        type="radio" 
                        name="hasCatalog" 
                        checked={data.constructionActivities?.hasCatalog === false} 
                        onChange={() => setHasCatalog(false)} 
                        className="h-4 w-4 border-gray-300 focus:ring-[#6C64DD]"
                        style={{ color: BRAND_COLOR }}
                    />
                    <span className="ml-2 text-sm text-gray-900">No</span>
                </label>
             </div>

             {data.constructionActivities?.hasCatalog === true && (
                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start animate-fadeIn">
                    <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-900 font-bold mb-1">Action Required</p>
                        <p className="text-sm text-blue-800">Please attach <strong>"Appendix A: Construction Activities"</strong> to your final Policies and Procedures Manual.</p>
                    </div>
                 </div>
             )}

             {data.constructionActivities?.hasCatalog === false && (
                 <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                        <p className="text-sm text-amber-900 font-bold mb-1">Incomplete</p>
                        <p className="text-sm text-amber-800">
                            To proceed compliant with Policy 33, you must define your construction activities. 
                            Please use the <a href="#" className="underline font-semibold hover:text-amber-900">Catalog Builder</a> to generate this list.
                        </p>
                    </div>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

// --- NEW CLIENT SERVICES STEP ---
const ClientServicesStep: React.FC<StepProps> = ({ data, onChange }) => {
    // Helper to update clientServices nested data
    const updateCS = (field: string, value: any) => {
        // @ts-ignore
        onChange('clientServices', { ...data.clientServices, [field]: value });
    };

    // For participation inside clientServices
    const updateParticipation = (field: string, value: string) => {
        const currentPart = data.clientServices?.participation || {};
        updateCS('participation', { ...currentPart, [field]: value });
    };

    const stages = data.clientServices?.stages || [];
    const participation = data.clientServices?.participation || { required: '', options: '', documentation: '' };

    return (
        <div className="space-y-8">
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center"><User className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Owner Participation (Sweat Equity)</h4>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Participation Requirement <span className="text-red-500">*</span></label>
                        <select 
                            className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" 
                            value={participation.required || ''} 
                            onChange={(e) => updateParticipation('required', e.target.value)}
                        >
                            <option value="" disabled>Select one</option>
                            <option value="not_required">Not Required (Recommended)</option>
                            <option value="required">Required</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Participation Options & Accommodations</label>
                        <textarea className="block w-full rounded-lg border-gray-300 p-2.5 border h-20 focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={participation.options || ''} onChange={(e) => updateParticipation('options', e.target.value)} placeholder="e.g. Site prep, lunch, education classes. Physical limitations accommodated via..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Documentation Method</label>
                        <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={participation.documentation || ''} onChange={(e) => updateParticipation('documentation', e.target.value)} placeholder="e.g. Homeowner Agreement Clause" />
                    </div>
                </div>
            </div>

             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center"><Activity className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Project Lifecycle Stages</h4>
                <div className="pl-4 border-l-2 border-gray-200 space-y-6">
                    {stages.map((stage) => (
                        <div key={stage.id} className="pl-4 relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_COLOR }}></div>
                            <h5 className="font-bold text-sm text-gray-800">{stage.name}</h5>
                            <div className="flex items-center text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded inline-block">
                                <FileText className="w-3 h-3 mr-1" />
                                <span className="font-semibold mr-1">Trigger:</span> {stage.reqDoc}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
    );
};

const ClientScreeningStep: React.FC<StepProps> = ({ data, onChange }) => {
  const getLabel = (key: string) => {
    if (key === 'healthSafety') return 'Health & Safety Urgency (Home Condition)';
    const group = VULNERABLE_GROUPS.find(g => g.key === key);
    return group ? group.label : key.replace(/([A-Z])/g, ' $1').trim();
  };

  const toggleGroup = (key: string) => {
    const newFactors = { ...data.priorityFactors };
    if (newFactors[key] !== undefined) {
      delete newFactors[key];
    } else {
      newFactors[key] = 3; // Default weight
    }
    onChange('priorityFactors', newFactors);
  };

  const updateFeasibility = (field: string, value: string) => {
    onChange('projectFeasibility', { ...data.projectFeasibility, [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* 2.1.1 Project Assessment & Selection Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center mb-4">
            <ClipboardCheck className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> 
            <h4 className="font-bold text-gray-900">Project Assessment & Selection</h4>
        </div>
        <p className="text-sm text-gray-500 mb-6">
            Define how you assess property feasibility and who makes the final decision (Policy 33 Sec 2.1.1).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Protocol</label>
                <select 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]"
                    value={data.projectFeasibility?.assessmentProtocol || 'internal'}
                    onChange={(e) => updateFeasibility('assessmentProtocol', e.target.value)}
                >
                    <option value="internal">Internal Staff Checklist</option>
                    <option value="partner">Third-Party Inspection</option>
                    <option value="hybrid">Hybrid (Staff + Specialist)</option>
                    <option value="energy">Energy/HERS Audit</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selection Authority (Role)</label>
                <input 
                    type="text" 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]"
                    value={data.projectFeasibility?.selectionAuthority || ''}
                    onChange={(e) => updateFeasibility('selectionAuthority', e.target.value)}
                    placeholder="e.g. Program Manager"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Decision Artifact (Document)</label>
                <input 
                    type="text" 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]"
                    value={data.projectFeasibility?.selectionArtifact || ''}
                    onChange={(e) => updateFeasibility('selectionArtifact', e.target.value)}
                    placeholder="e.g. Project Selection Scorecard, Approval Memo"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Feasibility Limits (Deferral Policy)</label>
                <textarea 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border h-24 focus:border-[#6C64DD] focus:ring-[#6C64DD]"
                    value={data.projectFeasibility?.feasibilityLimits || ''}
                    onChange={(e) => updateFeasibility('feasibilityLimits', e.target.value)}
                    placeholder="Describe when a project is rejected (e.g. Cost exceeds 50% of home value, structural instability, hoarding issues)."
                />
                <div className="flex items-center mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    <span>Clear deferral criteria protect your affiliate from liability and scope creep.</span>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4">Intake Channels</h4>
        <div className="flex flex-wrap gap-4">
          {['phone', 'web', 'walkin'].map(channel => (
            <label key={channel} className={`flex items-center space-x-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${data.intakeMethods[channel] ? 'bg-[#6C64DD]/10 border-[#6C64DD] ring-1 ring-[#6C64DD]' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
              <input 
                type="checkbox" 
                checked={data.intakeMethods[channel]}
                onChange={(e) => onChange('intakeMethods', { ...data.intakeMethods, [channel]: e.target.checked })}
                className="rounded focus:ring-[#6C64DD] h-5 w-5"
                style={{ color: BRAND_COLOR }}
              />
              <span className="capitalize text-sm font-medium text-gray-700">{channel === 'walkin' ? 'Walk-in' : channel}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-2">Target Populations</h4>
            <p className="text-sm text-gray-500">Select the specific vulnerable groups your program prioritizes.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {VULNERABLE_GROUPS.map(group => (
            <label key={group.key} className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${data.priorityFactors?.[group.key] !== undefined ? 'bg-[#6C64DD]/10 border-[#6C64DD]' : 'hover:bg-slate-50 border-transparent'}`}>
               <input 
                 type="checkbox"
                 className="mt-1 rounded focus:ring-[#6C64DD] h-4 w-4"
                 style={{ color: BRAND_COLOR }}
                 checked={data.priorityFactors?.[group.key] !== undefined}
                 onChange={() => toggleGroup(group.key)}
               />
               <div>
                 <div className={`text-sm font-medium ${data.priorityFactors?.[group.key] !== undefined ? 'text-[#6961CC]' : 'text-gray-700'}`}>{group.label}</div>
                 <div className="text-xs text-gray-500 mt-0.5">{group.reason}</div>
               </div>
            </label>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h4 className="font-bold text-gray-900 mb-4">Prioritization Matrix Weights (1-5)</h4>
          
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800 text-sm">Health & Safety Urgency</span>
                <span className="text-white text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: BRAND_COLOR }}>{data.priorityFactors?.healthSafety || 5}</span>
                </div>
                <input 
                type="range" 
                min="1" 
                max="5" 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6C64DD]"
                value={data.priorityFactors?.healthSafety || 5}
                onChange={(e) => onChange('priorityFactors', { ...data.priorityFactors, healthSafety: parseInt(e.target.value) })}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Low Priority</span>
                    <span>Critical</span>
                </div>
            </div>

            {Object.keys(data.priorityFactors || {}).filter(k => k !== 'healthSafety').map(factor => (
                <div key={factor}>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">{getLabel(factor)}</span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{data.priorityFactors[factor]}</span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8179E2]"
                    value={data.priorityFactors[factor]}
                    onChange={(e) => onChange('priorityFactors', { ...data.priorityFactors, [factor]: parseInt(e.target.value) })}
                />
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LifecycleStep: React.FC<StepProps> = ({ data }) => {
  return (
    <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center"><User className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Owner Participation (Sweat Equity)</h4>
            <div className="grid grid-cols-1 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                   <p className="text-sm text-gray-600 italic">Lifecycle details are configured in "Client Services". This view is for reference.</p>
                </div>
            </div>
        </div>
        
        {/* Stages List (Simplified View) */}
        <div className="pl-4 border-l-2 border-gray-200">
            {data.stages.map((stage) => (
                <div key={stage.id} className="mb-4 pl-4 relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_COLOR }}></div>
                    <h5 className="font-bold text-sm">{stage.name}</h5>
                    <p className="text-xs text-gray-500">{stage.reqDoc}</p>
                </div>
            ))}
        </div>
    </div>
  );
};

const WorkforceStep: React.FC<StepProps> = ({ data, onChange }) => {
  const updateProcurement = (field: string, value: string) => onChange('procurement', { ...data.procurement, [field]: value });
  const updateVolunteers = (field: string, value: string) => onChange('volunteerStandards', { ...data.volunteerStandards, [field]: value });
  const updateSafety = (field: string, value: string) => onChange('safety', { ...data.safety, [field]: value });
  const toggleDoc = (key: string) => {
      const currentDocs = data.procurement?.requiredDocs || {};
      onChange('procurement', { ...data.procurement, requiredDocs: { ...currentDocs, [key]: !currentDocs[key] } });
  };

  return (
    <div className="space-y-8">
      {/* Procurement */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Repair Partner (Contractor) Selection</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selection Method</label>
                <select className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.procurement?.selectionMethod || 'Preferred Vendor List'} onChange={(e) => updateProcurement('selectionMethod', e.target.value)}>
                    <option value="Bids">Competitive Bids (3+)</option>
                    <option value="Preferred Vendor List">Preferred Vendor List</option>
                    <option value="Sole Source">Sole Source (Specialized)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Qualifications</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.procurement?.minQualifications || ''} onChange={(e) => updateProcurement('minQualifications', e.target.value)} placeholder="License, Insurance limits, etc." />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Required Documentation</label>
                <div className="flex gap-4">
                    {['w9', 'coi', 'bonding', 'warranty'].map(doc => (
                        <label key={doc} className="flex items-center space-x-2">
                            <input type="checkbox" checked={data.procurement?.requiredDocs?.[doc] || false} onChange={() => toggleDoc(doc)} className="rounded text-blue-600 focus:ring-[#6C64DD]" />
                            <span className="uppercase text-sm">{doc}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Volunteer Standards */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center"><Users className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Volunteer Participation</h4>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Allowed vs. Prohibited Scopes</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.volunteerStandards?.allowedScopes || ''} onChange={(e) => updateVolunteers('allowedScopes', e.target.value)} placeholder="e.g. Painting allowed; Roofing prohibited" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Supervision Requirements</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.volunteerStandards?.supervision || ''} onChange={(e) => updateVolunteers('supervision', e.target.value)} placeholder="e.g. Ratio 1:5, Competent Person on site" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Training Requirements</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.volunteerStandards?.training || ''} onChange={(e) => updateVolunteers('training', e.target.value)} placeholder="e.g. Online safety video, Ladder safety" />
            </div>
        </div>
      </div>

      {/* Safety */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center"><HardHat className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Risk Management & Safety</h4>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Risk Screening Topics</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.safety?.riskScreening || ''} onChange={(e) => updateSafety('riskScreening', e.target.value)} placeholder="e.g. Lead, Asbestos, Structural, Pets" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Safety Plan Elements</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.safety?.safetyPlan || ''} onChange={(e) => updateSafety('safetyPlan', e.target.value)} placeholder="e.g. PPE, Morning Briefs, Stop Work Authority" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mandatory Specialty Contractors</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.safety?.specialtyContractorTriggers || ''} onChange={(e) => updateSafety('specialtyContractorTriggers', e.target.value)} placeholder="e.g. Electrical, High Roofs, HVAC" />
            </div>
        </div>
      </div>
    </div>
  );
};

const PerformanceStep: React.FC<StepProps> = ({ data, onChange }) => {
  const updateSustainability = (field: string, value: string) => onChange('sustainability', { ...data.sustainability, [field]: value });

  return (
    <div className="space-y-8">
      {/* Financial Sustainability */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center"><Activity className="w-5 h-5 mr-2" style={{ color: BRAND_COLOR }}/> Financial Sustainability</h4>
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Funding Mix Strategy</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.sustainability?.fundingMix || ''} onChange={(e) => updateSustainability('fundingMix', e.target.value)} placeholder="e.g. Grants, Fees, Donations" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Controls & Contingency</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.sustainability?.costControls || ''} onChange={(e) => updateSustainability('costControls', e.target.value)} placeholder="e.g. 10% contingency on all projects" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Targets (Pipeline)</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.sustainability?.pipelineTargets || ''} onChange={(e) => updateSustainability('pipelineTargets', e.target.value)} placeholder="e.g. 15 homes" />
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4">Reporting & Feedback</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reporting Schedule</label>
                <select className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.reportingSchedule} onChange={(e) => onChange('reportingSchedule', e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback Mechanism</label>
                <input type="text" className="block w-full rounded-lg border-gray-300 p-2.5 border focus:border-[#6C64DD] focus:ring-[#6C64DD]" value={data.feedbackMechanism} onChange={(e) => onChange('feedbackMechanism', e.target.value)} placeholder="e.g. Annual Survey" />
            </div>
        </div>
      </div>
    </div>
  );
};

// ... ComplianceStep remains same as v1.4.0 ...
const ComplianceStep: React.FC<StepProps> = ({ data, onChange }) => {
    // Keeping existing logic
    const updateGovernance = (field: string, value: string) => onChange('governance', { ...data.governance, [field]: value });
    const toggleCheck = (key: string) => {
        const newChecklist = { ...data.policy33Checklist, [key]: !data.policy33Checklist[key] };
        onChange('policy33Checklist', newChecklist);
    };
    const checklistItems = [
        { key: 'codes', label: '2.1.2 Compliance with building codes & industry standards' },
        { key: 'agreements', label: '2.1.3 Written agreements executed before work' },
        { key: 'consumerProtection', label: '2.1.4 Compliance with consumer protection laws' },
        { key: 'lendingCompliance', label: '2.1.5 Compliance with lending laws (if applicable)' },
        { key: 'subcontractorOversight', label: '2.1.6 Subcontractor insurance and bonding' },
        { key: 'insurance', label: '2.1.8 Adequate insurance coverage maintenance' },
    ];
    return (
        <div className="space-y-8 max-w-4xl">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-200"><h3 className="font-bold text-gray-800">Compliance & Governance</h3></div>
                <div className="p-6 grid grid-cols-2 gap-6">
                    <input type="date" className="border p-2 rounded" value={data.governance.approvalDate} onChange={(e) => updateGovernance('approvalDate', e.target.value)} />
                    <input type="text" className="border p-2 rounded" value={data.governance.policyVersion} onChange={(e) => updateGovernance('policyVersion', e.target.value)} placeholder="Version" />
                </div>
                <div className="p-6 border-t">
                    <h4 className="font-bold mb-4">Requirements</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {checklistItems.map(item => (
                            <label key={item.key} className="flex items-start space-x-2">
                                <input type="checkbox" className="mt-1" checked={data.policy33Checklist[item.key]} onChange={() => toggleCheck(item.key)} />
                                <span className="text-sm">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExportStep: React.FC<{ data: ManualData }> = ({ data }) => {
  const handleExport = () => {
    // Generate a simple HTML document that acts as a Doc
    const getLabel = (key: string) => {
        if (key === 'healthSafety') return 'Health & Safety Urgency (Home Condition)';
        const group = VULNERABLE_GROUPS.find(g => g.key === key);
        return group ? group.label : key.replace(/([A-Z])/g, ' $1').trim();
    };

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <style>
            @page { size: 8.5in 11in; margin: 1.0in; }
            body { font-family: Arial, sans-serif; font-size: 9pt; line-height: 13pt; color: #000000; }
            .cover-page { text-align: center; padding-top: 3in; page-break-after: always; background-color: #00467F; color: white; height: 9in; }
            .title { font-family: 'Arial Black', Arial, sans-serif; font-size: 38pt; font-weight: bold; color: #FFFFFF; }
            .subtitle { font-family: 'Arial', sans-serif; font-size: 24pt; font-weight: bold; color: #FFFFFF; margin-top: 20pt; }
            .edition { font-size: 14pt; margin-top: 40pt; color: #FFFFFF; }
            
            h1 { font-family: Arial, sans-serif; font-size: 24pt; color: #000000; margin-top: 13pt; page-break-before: always; }
            h2 { font-family: Arial, sans-serif; font-size: 14pt; font-weight: bold; color: #000000; margin-top: 13pt; }
            h3 { font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; color: #000000; margin-top: 13pt; }
            p { margin-top: 3pt; margin-bottom: 3pt; }
            ul { margin-top: 3pt; margin-bottom: 3pt; }
            li { margin-bottom: 3pt; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10pt; font-size: 9pt; }
            th, td { border: 1px solid #000000; padding: 6px; vertical-align: top; text-align: left; }
            th { font-weight: bold; background-color: #f0f0f0; }
        </style>
      <title>${data.orgName} Repair Manual</title></head>
      <body>
        <!-- Cover Page -->
        <div class="cover-page">
            <div class="title">Policies and Procedures Manual</div>
            <div class="subtitle">Repairs</div>
            <div class="edition">
                ${data.orgName}<br/>
                Version ${data.governance.policyVersion || '1.0'}<br/>
                Date: ${data.governance.approvalDate || new Date().toLocaleDateString()}
            </div>
        </div>

        <h1>1. Introduction & Foundations</h1>
        <p><strong>Affiliate:</strong> ${data.orgName}</p>
        <p><strong>Address:</strong> ${data.orgAddress || 'N/A'}</p>
        <p><strong>Phone:</strong> ${data.orgPhone || 'N/A'} | <strong>Email:</strong> ${data.orgEmail || 'N/A'}</p>
        <p><strong>Service Area:</strong> ${data.serviceArea}</p>
        <h3>Key Staff</h3>
        <ul>
          ${(data.staff || []).map(s => `<li><strong>${s.name}</strong> - ${s.title}</li>`).join('')}
        </ul>
        
        <h2>2. Affiliate Policy Map</h2>
        <table border="1" cellpadding="5" cellspacing="0">
            <tr>
                <th>Category</th>
                <th align="center">Org Level</th>
                <th align="center">Program Level</th>
                <th>Details</th>
            </tr>
            ${Object.keys(data.policyMap).map(key => {
                const entry = data.policyMap[key] || { org: false, program: false, programDetails: '' };
                const isOrg = typeof entry === 'object' ? entry.org : entry;
                const isProgram = typeof entry === 'object' ? entry.program : false; 
                
                const detailsParts = [];
                if (isOrg) detailsParts.push("Insert Affiliate-level Policy here.");
                if (isProgram && entry.programDetails) detailsParts.push(entry.programDetails);

                return `
                    <tr>
                        <td>${key.charAt(0).toUpperCase() + key.slice(1)}</td>
                        <td align="center">${isOrg ? 'Yes' : ''}</td>
                        <td align="center">${isProgram ? 'Yes' : ''}</td>
                        <td>${detailsParts.join('<br>')}</td>
                    </tr>
                `;
            }).join('')}
        </table>

        <h2>3. Program Policies (Policy 33)</h2>
        ${REQUIRED_TOPICS_2_1_1.filter(topic => data.policyPackage?.coveredTopics?.[topic.key]).map(topic => `
            <h3>${topic.label}</h3>
            <p>${data.policyPackage?.topicContent?.[topic.key] || 'No specific policy text provided.'}</p>
        `).join('')}

        <h2>4. Pricing & Repayment</h2>
        <p><strong>Model:</strong> ${data.pricing?.modelType || 'N/A'}</p>
        <p><strong>Calculation:</strong> ${data.pricing?.calculationMethod || 'N/A'}</p>
        <p><strong>Terms:</strong> ${data.pricing?.repaymentTerms || 'N/A'}</p>
        <p><strong>Financial Cap:</strong> $${data.financialCap}</p>

        <h2>5. Scope of Services</h2>
        <p><strong>Construction Activities:</strong> ${data.constructionActivities?.hasCatalog ? 'Refer to Appendix A: Construction Activities' : 'Not Defined'}</p>
        <p><strong>Exclusions:</strong> ${data.constructionActivities?.ineligibleScopes || 'N/A'}</p>
        <p><strong>Permits:</strong> ${data.constructionActivities?.permitTriggers || 'N/A'}</p>
        
        <h2>6. Client Screening & Selection</h2>
        <h3>Intake</h3>
        <p><strong>Channels:</strong> ${Object.keys(data.intakeMethods).filter(k => data.intakeMethods[k]).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ') || 'None selected'}</p>
        
        <h3>Assessment & Selection</h3>
        <p><strong>Assessment Protocol:</strong> ${data.projectFeasibility?.assessmentProtocol || 'N/A'}</p>
        <p><strong>Selection Authority:</strong> ${data.projectFeasibility?.selectionAuthority || 'N/A'}</p>
        <p><strong>Decision Documentation:</strong> ${data.projectFeasibility?.selectionArtifact || 'N/A'}</p>
        <p><strong>Feasibility Limits:</strong> ${data.projectFeasibility?.feasibilityLimits || 'N/A'}</p>
        
        <h3>Prioritization</h3>
        <p>Applications are prioritized based on the following weighted criteria:</p>
        <ul>
           ${Object.keys(data.priorityFactors || {}).map(key => `<li><strong>${getLabel(key)}:</strong> Weight ${data.priorityFactors[key]}</li>`).join('')}
        </ul>

        <h2>7. Client Services & Participation</h2>
        <p><strong>Participation Requirement:</strong> ${data.clientServices?.participation?.required === 'required' ? 'Required' : (data.clientServices?.participation?.required === 'not_required' ? 'Not Required (Recommended)' : 'N/A')}</p>
        <p><strong>Options & Accommodations:</strong> ${data.clientServices?.participation?.options || 'N/A'}</p>
        <p><strong>Documentation Method:</strong> ${data.clientServices?.participation?.documentation || 'N/A'}</p>

        <h2>8. Project Lifecycle</h2>
        <h3>Stages</h3>
        <ol>
           ${data.stages.map(s => `<li><strong>${s.name}</strong> (Trigger: ${s.reqDoc})</li>`).join('')}
        </ol>

        <h2>9. Workforce & Safety</h2>
        <p><strong>Delivery Model:</strong> ${data.model || 'N/A'}</p>
        <p><strong>QC Frequency:</strong> ${data.qcFrequency || 'N/A'}</p>
        
        <h3>Contractors</h3>
        <p><strong>Selection Method:</strong> ${data.procurement?.selectionMethod || 'N/A'}</p>
        <p><strong>Min Qualifications:</strong> ${data.procurement?.minQualifications || 'N/A'}</p>
        <p><strong>Required Docs:</strong> ${Object.keys(data.procurement?.requiredDocs || {}).filter(k => data.procurement.requiredDocs[k]).map(k => k.toUpperCase()).join(', ')}</p>
        
        <h3>Volunteers</h3>
        <p><strong>Allowed Scopes:</strong> ${data.volunteerStandards?.allowedScopes || 'N/A'}</p>
        <p><strong>Supervision:</strong> ${data.volunteerStandards?.supervision || 'N/A'}</p>
        <p><strong>Training:</strong> ${data.volunteerStandards?.training || 'N/A'}</p>
        
        <h3>Safety</h3>
        <p><strong>Risk Screening:</strong> ${data.safety?.riskScreening || 'N/A'}</p>
        <p><strong>Safety Plan:</strong> ${data.safety?.safetyPlan || 'N/A'}</p>
        <p><strong>Specialty Contractor Triggers:</strong> ${data.safety?.specialtyContractorTriggers || 'N/A'}</p>

        <h2>10. Sustainability & Performance</h2>
        <p><strong>Funding Mix:</strong> ${data.sustainability?.fundingMix || 'N/A'}</p>
        <p><strong>Cost Controls:</strong> ${data.sustainability?.costControls || 'N/A'}</p>
        <p><strong>Pipeline Targets:</strong> ${data.sustainability?.pipelineTargets || 'N/A'}</p>
        <p><strong>Reporting Schedule:</strong> ${data.reportingSchedule}</p>
        <p><strong>Feedback Mechanism:</strong> ${data.feedbackMechanism}</p>
        <p><strong>Tracked KPIs:</strong></p>
        <ul>
            ${Object.keys(data.kpis).filter(k => data.kpis[k]).map(k => `<li>${k.replace(/([A-Z])/g, ' $1')}</li>`).join('')}
        </ul>

        <h2>11. Compliance Declaration</h2>
        <p><strong>Policy 33 Alignment:</strong> ${data.policy33Aligned ? 'Compliant' : 'Pending'}</p>
        <p><strong>Governance:</strong> Approved by ${data.governance.approverRole} on ${data.governance.approvalDate}.</p>
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', content], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Repair_Manual_${data.orgName.replace(/\s+/g, '_')}_Draft.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 text-center max-w-lg w-full">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 mb-6"><CheckCircle className="h-10 w-10 text-green-500" /></div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Publish</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">Your draft is compliant with the standard structure. Export it to Word to add final branding and signatures.</p>
        <button onClick={handleExport} className="w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-bold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-all"><Download className="mr-2 h-5 w-5" /> Export to Word (.doc)</button>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function RepairManualBuilder() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'builder'
  const [manualData, setManualData] = useState<ManualData>(INITIAL_DATA);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Auth & Data Loading ---
  
  useEffect(() => {
    // 1. Check LocalStorage First
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        setManualData(JSON.parse(localData));
      } catch (e) {
        console.error("Error parsing local data", e);
      }
    }
    
    // Simulate Loading for smoother UX
    setTimeout(() => setLoading(false), 500);

  }, []);

  // --- Favicon Logic ---
  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    (link as HTMLLinkElement).type = 'image/png';
    (link as HTMLLinkElement).rel = 'shortcut icon';
    (link as HTMLLinkElement).href = LOGO_URL;
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  // --- Auto-Save Logic (Local Only) ---
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDataChange = useCallback((field: keyof ManualData, value: any) => {
    setManualData(prev => {
        const newData = { ...prev, [field]: value, lastUpdated: new Date().toISOString() };
        
        // Immediate Local Save
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

        setSaveStatus('saving');
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            setSaveStatus('saved'); // Optimistic local save
        }, 1000);

        return newData;
    });
  }, []);

  // --- Rendering Helpers ---

  const renderStepContent = () => {
    const commonProps = { data: manualData, onChange: handleDataChange };
    switch (STEPS[currentStep].id) {
      case 'foundations': return <FoundationsStep {...commonProps} />;
      case 'compliance': return <ComplianceStep {...commonProps} />;
      case 'policyMap': return <PolicyMapStep {...commonProps} />;
      case 'programModel': return <ProgramModelStep {...commonProps} />;
      case 'scope': return <ScopeStep {...commonProps} />;
      case 'clientServices': return <ClientServicesStep {...commonProps} />;
      case 'screening': return <ClientScreeningStep {...commonProps} />;
      case 'lifecycle': return <LifecycleStep {...commonProps} />;
      case 'workforce': return <WorkforceStep {...commonProps} />;
      case 'performance': return <PerformanceStep {...commonProps} />;
      case 'export': return <ExportStep data={manualData} />;
      default: return <div>Unknown Step</div>;
    }
  };

  const isStepComplete = (stepId: string, data: ManualData) => {
    if (stepId === 'scope') return data.constructionActivities?.hasCatalog === true;
    if (stepId === 'foundations') {
        return !!(data.orgName && data.orgAddress && data.orgPhone && data.orgEmail && data.serviceArea);
    }
    if (stepId === 'policyMap') {
        const categories = Object.values(data.policyMap || {});
        return categories.length > 0 && categories.every(cat => cat.org || cat.program);
    }
    if (stepId === 'clientServices') {
      return data.clientServices?.participation?.required !== '';
    }
    // Default simplified logic for other steps
    return false;
  };

  const isStepWarning = (stepId: string, data: ManualData) => {
    if (stepId === 'scope') return data.constructionActivities?.hasCatalog === false;
    if (stepId === 'foundations') {
         return !(data.orgName && data.orgAddress && data.orgPhone && data.orgEmail && data.serviceArea);
    }
    if (stepId === 'policyMap') {
        const categories = Object.values(data.policyMap || {});
        return categories.length === 0 || !categories.every(cat => cat.org || cat.program);
    }
    if (stepId === 'clientServices') {
      return data.clientServices?.participation?.required === '';
    }
    return false;
  };

  if (loading) return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
             <Activity className="w-10 h-10 text-blue-600 animate-spin mb-4" />
             <p className="text-gray-500 font-medium">Loading Builder...</p>
          </div>
      </div>
  );

  if (currentView === 'landing') {
    return <LandingPage onStart={() => setCurrentView('builder')} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Dark Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 rounded-lg" style={{ backgroundColor: BRAND_COLOR }}>
              <img src={LOGO_URL} alt="Policy Builder" className="h-6 w-6 object-contain" />
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tracking-tight leading-none text-white">Policy Builder</span>
                <span className="text-xs text-blue-400 font-medium">for Repair programs</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            // Custom status logic
            const isCustomStep = ['scope', 'foundations', 'policyMap', 'clientServices'].includes(step.id);
            const complete = isStepComplete(step.id, manualData) || (!isCustomStep && index < currentStep); 
            const warning = isStepWarning(step.id, manualData);

            return (
              <button
                key={step.id}
                onClick={() => { setCurrentStep(index); setMobileMenuOpen(false); }}
                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'text-white shadow-lg shadow-blue-900/20' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
                style={isActive ? { backgroundColor: BRAND_COLOR } : {}}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                <div className="flex-1 text-left">
                  {step.title}
                </div>
                {warning && <AlertCircle className="h-4 w-4 text-amber-500" />}
                {complete && !warning && <CheckCircle className="h-4 w-4 text-emerald-500" />}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
            {/* Home Navigation */}
            <button 
                onClick={() => setCurrentView('landing')}
                className="w-full flex items-center p-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
                <Home className="w-4 h-4 mr-3" />
                Back to Home
            </button>

            {/* Access Guide Button (Placeholder) */}
            <button 
                onClick={() => window.open('#', '_blank')} 
                className="w-full flex items-center p-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
                <ExternalLink className="w-4 h-4 mr-3" />
                Access Guide
            </button>

            <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project</span>
                </div>
                <div className="text-sm font-medium text-white truncate mb-1">
                    {manualData.orgName || 'New Project'}
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-600">v{APP_VERSION}</span>
                    <span className={`flex items-center ${saveStatus === 'saved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {saveStatus === 'saving' ? <Activity className="w-3 h-3 mr-1 animate-pulse"/> : <Save className="w-3 h-3 mr-1"/>}
                        {saveStatus === 'saved' ? 'Saved' : 'Saving...'}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 shadow-sm flex items-center justify-between border-b border-gray-200 z-20">
           <div className="flex items-center">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mr-3 text-gray-600">
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
                <span className="font-bold text-gray-800">Policy Builder</span>
           </div>
        </div>

        {/* Desktop Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{STEPS[currentStep].title}</h2>
            <p className="mt-1 text-sm text-gray-500">{STEPS[currentStep].description}</p>
          </div>
          <div className="flex space-x-3">
             <button 
               onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
               disabled={currentStep === 0}
               className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
             >
               Back
             </button>
             <button 
               onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
               disabled={currentStep === STEPS.length - 1}
               className="px-4 py-2 text-white rounded-lg shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all text-sm"
               style={{ backgroundColor: BRAND_COLOR }}
               onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND_COLOR_DARK}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = BRAND_COLOR}
             >
               Next Step <ChevronRight className="ml-2 h-4 w-4" />
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex">
           {/* Scrollable Form Content */}
           <div className="flex-1 overflow-y-auto p-8 lg:p-12">
             <div className="max-w-3xl mx-auto pb-12">
                {renderStepContent()}
             </div>
           </div>

           {/* Fixed Guide Panel (Right Sidebar) */}
           <div className="w-80 border-l border-gray-200 bg-white hidden lg:block overflow-y-auto shrink-0 shadow-[rgba(0,0,15,0.05)_0px_0px_10px_0px]">
              <GuidePanel stepId={STEPS[currentStep].id} />
           </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}
