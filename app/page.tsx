"use client"

import { useState, useRef, useEffect } from "react"
import SignatureCanvas from 'react-signature-canvas'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Shield, CreditCard, CheckCircle, Building2 } from "lucide-react"

interface FormData {
  // Step 1: Personal Information
  fullName: string
  dateOfBirth: string
  gender: string
  phoneNumber: string
  email: string
  street: string
  city: string
  state: string
  zip: string
  country: string

  // Step 2: Professional Credentials
  nationalId: string
  taxId: string
  licenseNumber: string
  idDocument: File | null
  certifications: File | null

  // Step 3: Bank & Payment Details
  bankName: string
  accountNumber: string
  routingNumber: string
  paymentMethod: string

  // Step 4: Tax Forms & Agreements
  taxFormSigned: boolean
  employeeAgreementSigned: boolean
  contractSigned: boolean
  eSignature: string // Keep for fallback/previous data
  signatureData: string | null // Base64 signature data from canvas

  // Step 5: Review & Submit
  confirmAccuracy: boolean

  // Salary Fields
  payGroupId: string
  payTypeId: string
  frequencyId: string
  normalHours: string
  annualSalary: string
  perPaySalary: string
  hourlyRate: string

  // Tax Location
  vertexGeoCode: string
  psdCode: string

  // Federal Income Tax
  federalFilingStatusId: string
  federalIsBlocked: boolean
  federalMultipleJobs: boolean
  federalDependentExemption: string
  federalAdditionalIncome: string
  federalDeductionExemption: string
  federalAdditionalAmount: string
  federalAdditionalPercent: string
  federalAdditionalTypeId: string

  // I-9 Information
  isI9Completed: boolean
  i9CompletionDate: string
  citizenshipId: string
}

const steps = [
  { id: 1, title: "Personal Information", icon: Building2 },
  { id: 2, title: "Professional Credentials", icon: Shield },
  { id: 3, title: "Bank & Payment Details", icon: CreditCard },
  { id: 4, title: "Tax Forms & Agreements", icon: FileText },
  { id: 5, title: "Review & Submit", icon: CheckCircle },
]

export default function AgentOnboardingPortal() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    nationalId: "",
    taxId: "",
    licenseNumber: "",
    idDocument: null,
    certifications: null,
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    paymentMethod: "",
    taxFormSigned: false,
    employeeAgreementSigned: false,
    contractSigned: false,
    eSignature: "",
    signatureData: null,
    confirmAccuracy: false,
    payGroupId: "",
    payTypeId: "",
    frequencyId: "",
    normalHours: "",
    annualSalary: "",
    perPaySalary: "",
    hourlyRate: "",
    vertexGeoCode: "",
    psdCode: "",
    federalFilingStatusId: "",
    federalIsBlocked: false,
    federalMultipleJobs: false,
    federalDependentExemption: "",
    federalAdditionalIncome: "",
    federalDeductionExemption: "",
    federalAdditionalAmount: "",
    federalAdditionalPercent: "",
    federalAdditionalTypeId: "0",
    isI9Completed: false,
    i9CompletionDate: "",
    citizenshipId: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState<string>("")

  const idInputRef = useRef<HTMLInputElement>(null)
  const certInputRef = useRef<HTMLInputElement>(null)

  const updateFormData = (field: keyof FormData, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        e.target.value = ""
        return
      }
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        alert("Only PDF, JPG, PNG files are allowed")
        e.target.value = ""
        return
      }
      updateFormData("idDocument", file)
    }
  }
  const sigCanvasRef = useRef<SignatureCanvas | null>(null)

  // Clear signature
  const clearSignature = () => {
    sigCanvasRef.current?.clear()
    updateFormData("signatureData", null)
  }

  // Get signature data
  const getSignatureData = () => {
    if (sigCanvasRef.current) {
      const data = sigCanvasRef.current.toDataURL()
      updateFormData("signatureData", data)
      return data
    }
    return null
  }

  // Check if signature exists
  const hasSignature = () => {
    return sigCanvasRef.current?.isEmpty() === false
  }

  // Validate signature
  // const validateSignature = (): boolean => {
  //   const hasSig = hasSignature()
  //   if (!hasSig) {
  //     setErrors(prev => ({
  //       ...prev,
  //       signatureData: "Please provide your electronic signature"
  //     }))
  //     return false
  //   }

  //   // Also validate it matches full name intent
  //   if (formData.fullName && formData.fullName.trim()) {
  //     // You could add additional validation here if needed
  //   }

  //   setErrors(prev => {
  //     const next = { ...prev }
  //     delete next.signatureData
  //     delete next.eSignature // Remove old eSignature error
  //     return next
  //   })
  //   return true
  // }

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        e.target.value = ""
        return
      }
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        alert("Only PDF, JPG, PNG files are allowed")
        e.target.value = ""
        return
      }
      updateFormData("certifications", file)
    }
  }

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Enhanced full name validation
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    } else {
      const parts = formData.fullName.trim().split(/\s+/).filter(Boolean);
      if (parts.length < 2) {
        newErrors.fullName = "Please enter both first and last name";
      }
    }

    // Date of birth: required, valid date, not in the future
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      // normalize today's time to start of day so comparison is date-only
      today.setHours(0, 0, 0, 0);

      if (isNaN(dob.getTime())) {
        newErrors.dateOfBirth = "Invalid date of birth";
      } else if (dob.getTime() > today.getTime()) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      }
    }

    // Phone number: required and basic validity check (8-15 digits after stripping non-digits)
    if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      const digitsOnly = String(formData.phoneNumber).replace(/\D/g, "");
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        newErrors.phoneNumber = "Invalid phone number format";
      }
    }

    // Email and other address fields (kept as you had them)
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.street) newErrors.street = "Street address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.zip) newErrors.zip = "ZIP code is required";
    if (!formData.country) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.nationalId) newErrors.nationalId = "SSN is required"
    else if (formData.nationalId && !/^\d{3}-\d{2}-\d{4}$/.test(formData.nationalId)) newErrors.nationalId = "Enter SSN as XXX-XX-XXXX"
    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  // const validateStep3 = (): boolean => {
  //   const newErrors: Partial<Record<keyof FormData, string>> = {}
  //   if (!formData.bankName) newErrors.bankName = "Bank name is required"
  //   if (!formData.paymentMethod) newErrors.paymentMethod = "Preferred payment method is required"
  //   if (!formData.accountNumber) newErrors.accountNumber = "Account number is required"
  //   if (!formData.routingNumber) newErrors.routingNumber = "Routing/SWIFT number is required"
  //   setErrors((prev) => ({ ...prev, ...newErrors }))
  //   return Object.keys(newErrors).length === 0
  // }



  // const validateStep4 = (): boolean => {
  //   const newErrors: Partial<Record<keyof FormData, string>> = {}
  //   if (!formData.taxFormSigned) newErrors.taxFormSigned = "Please mark W-9 as completed"
  //   if (!formData.employeeAgreementSigned) newErrors.employeeAgreementSigned = "Please sign the employee agreement"
  //   if (!formData.contractSigned) newErrors.contractSigned = "Please sign the employee contract"

  //   // E-signature must exactly match full name (case insensitive)
  //   if (!formData.eSignature) {
  //     newErrors.eSignature = "E-signature is required"
  //   } else if (formData.eSignature.trim().toLowerCase() !== formData.fullName.trim().toLowerCase()) {
  //     newErrors.eSignature = `E-signature must match your full name exactly: "${formData.fullName}"`
  //   }

  //   setErrors((prev) => ({ ...prev, ...newErrors }))
  //   return Object.keys(newErrors).length === 0
  // }
  // safer: avoid explicit `any`
  const isBlank = (s?: unknown) => {
    return s === undefined || s === null || String(s).trim().length === 0;
  };

  const validateStep3Enhanced = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    // Existing validations...
    // Bank name: required, not blank, only letters and spaces
    if (isBlank(formData.bankName)) {
      newErrors.bankName = "Bank name is required";
    } else if (!/^[A-Za-z\s]+$/.test(String(formData.bankName).trim())) {
      newErrors.bankName = "Bank name can only contain letters and spaces";
    }
    // Payment method: required and not blank
    formData.paymentMethod = "bank-transfer"
    if (isBlank(formData.paymentMethod)) {
      newErrors.paymentMethod = "Preferred payment method is required";
    }
    // Account number: required, not blank, numeric only
    if (isBlank(formData.accountNumber)) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(String(formData.accountNumber).trim())) {
      newErrors.accountNumber = "Account number must contain only digits";
    }
    // Routing/SWIFT: required, not blank, allowed characters (letters, numbers, hyphen)
    if (isBlank(formData.routingNumber)) {
      newErrors.routingNumber = "Routing/SWIFT number is required";
    } else if (!/^[A-Za-z0-9-]+$/.test(String(formData.routingNumber).trim())) {
      newErrors.routingNumber = "Routing/SWIFT may contain only letters, numbers and hyphens";
    }

    // New salary validations
    // if (!formData.payTypeId) newErrors.payTypeId = "Pay type is required"
    // if (!formData.frequencyId) newErrors.frequencyId = "Pay frequency is required"
    // if (formData.annualSalary && isNaN(Number(formData.annualSalary))) {
    //   newErrors.annualSalary = "Annual salary must be a valid number"
    // }

    // Tax location
    // if (!formData.vertexGeoCode) newErrors.vertexGeoCode = "Residence location code is required"
    // if (formData.vertexGeoCode && formData.vertexGeoCode.length > 9) {
    //   newErrors.vertexGeoCode = "Geo code must be 9 characters or less"
    // }

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const validateStep4Enhanced = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.taxFormSigned) newErrors.taxFormSigned = "Please mark W-9 as completed"

    // Signature validation
    if (!hasSignature()) {
      newErrors.signatureData = "Electronic signature is required"
    } else if (formData.fullName && !formData.signatureData) {
      newErrors.signatureData = "Please complete your signature"
    }

    // // I-9 validation
    // if (!formData.isI9Completed) newErrors.isI9Completed = "I-9 completion is required"
    // if (formData.isI9Completed && !formData.i9CompletionDate) {
    //   newErrors.i9CompletionDate = "I-9 completion date is required"
    // }
    // if (!formData.citizenshipId) newErrors.citizenshipId = "Citizenship status is required"

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const validateStep5 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.confirmAccuracy) newErrors.confirmAccuracy = "Please confirm accuracy before submitting"
    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    let ok = true
    if (currentStep === 1) {
      ok = validateStep1()
    }
    if (currentStep === 2) {
      ok = validateStep2()
    }
    if (currentStep === 3) {
      ok = validateStep3Enhanced() // Updated
    }
    if (currentStep === 4) {
      ok = validateStep4Enhanced() // Updated
    }
    if (ok && currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    console.log("Submit clicked")
    const ok = validateStep5()
    if (!ok) {
      console.log("Validation failed", errors)
      return
    }
    console.log("Validation passed, preparing payload")
    const { firstName, lastName, middleInitial } = (() => {
      const fullName: string = formData.fullName || ""
      const parts = fullName.trim().split(/\s+/).filter(Boolean)
      const first = parts[0] || ""
      const last = parts.length > 1 ? parts[parts.length - 1] : ""
      const middle = parts.length > 2 ? parts.slice(1, -1).join(" ") : ""
      return {
        firstName: first,
        lastName: last,
        middleInitial: middle ? middle[0] : "",
      }
    })()

    const toEmptyString = (value: string | null | undefined) => {
      if (value === null || value === undefined) return ""
      const s = String(value)
      return s.trim().length > 0 ? s : ""
    }

    // Get current date
    const today = new Date();

    // Format as YYYY-MM-DD
    const formattedDate = today.toISOString().split('T')[0];

    console.log(formattedDate); // Output: "2025-10-26"

    const idDocumentName = formData.idDocument ? formData.idDocument.name : ""
    const certificationsName = formData.certifications ? formData.certifications.name : ""

    const payload = {
      first_name: toEmptyString(firstName),
      last_name: toEmptyString(lastName),
      middle_initial: toEmptyString(middleInitial),
      email: toEmptyString(formData.email),
      phone: toEmptyString(formData.phoneNumber),
      secondary_phone: "",
      date_of_birth: toEmptyString(formData.dateOfBirth),
      gender: toEmptyString(formData.gender),
      password: "Test@123",
      ssn: toEmptyString(formData.nationalId),
      former_names: "",
      driver_license_number: "",
      driver_license_state: "",
      address: toEmptyString(formData.street),
      city: toEmptyString(formData.city),
      state: toEmptyString(formData.state),
      zip_code: toEmptyString(formData.zip),
      country: toEmptyString(formData.country),
      position_title: "",
      md_license_number: toEmptyString(formData.licenseNumber),
      lines_of_authority: "",
      license_expiration_date: null,
      ahip_certification_date: null,
      license_disciplinary_action: "",
      national_id: toEmptyString(formData.nationalId),
      tax_id: toEmptyString(formData.taxId),
      license_number: toEmptyString(formData.licenseNumber),
      id_document: idDocumentName,
      certifications: certificationsName,
      bank_name: toEmptyString(formData.bankName),
      account_number: toEmptyString(formData.accountNumber),
      routing_number: toEmptyString(formData.routingNumber),
      preferred_payment_method: toEmptyString(formData.paymentMethod),
      tax_form_w9: formData.taxFormSigned,
      employee_agreement: formData.employeeAgreementSigned,
      employee_contract: formData.contractSigned,
      e_signature: formData.signatureData || "", // Keep full name for reference
      ahip_complete: false,
      filing_status: "",
      agency: "",
      notes: "",
      file_url: idDocumentName,
      second_file_url: certificationsName,
      dependents_children: 0,
      dependents_other: 0,
      other_credits: 0,
      other_income: 0,
      deductions: 0,
      extra_withholding: 0,
      md_exemptions: 0,
      md_additional_withholding: 0,
      md_exempt_line3: false,
      md_exempt_line4: false,
      md_exempt_line5: false,
      md_exempt_line6: false,
      md_exempt_line7: false,
      md_exempt_line8: false,
      npn: "",
      other_states: "",
      carriers: "",
      old_upline: "",


      // Salary fields
      pay_group_id: formData.payGroupId,
      pay_type_id: formData.payTypeId,
      frequency_id: formData.frequencyId,
      normal_hours: toEmptyString(formData.normalHours),
      annual_salary: parseFloat(formData.annualSalary) || 0,
      per_pay_salary: parseFloat(formData.perPaySalary) || 0,
      hourly_rate: parseFloat(formData.hourlyRate) || 0,

      // Tax location
      vertex_geo_code: toEmptyString(formData.vertexGeoCode),
      psd_code: toEmptyString(formData.psdCode),

      // Federal tax
      federal_filing_status_id: toEmptyString(formData.federalFilingStatusId),
      federal_is_blocked: formData.federalIsBlocked,
      federal_multiple_jobs: formData.federalMultipleJobs,
      federal_dependent_exemption: parseFloat(formData.federalDependentExemption) || 0,
      federal_additional_income: parseFloat(formData.federalAdditionalIncome) || 0,
      federal_deduction_exemption: parseFloat(formData.federalDeductionExemption) || 0,
      federal_additional_amount: parseFloat(formData.federalAdditionalAmount) || 0,
      federal_additional_percent: parseFloat(formData.federalAdditionalPercent) || 0,
      federal_additional_type_id: parseInt(formData.federalAdditionalTypeId) || 0,

      // I-9
      is_i9_completed: formData.isI9Completed,
      i9_completion_date: formattedDate,
      citizenship_id: formData.citizenshipId,


    }

    console.log("Payload prepared:", payload)

    try {
      setSubmitStatus("submitting");
      console.log("Sending initial agent info...");

      const agentInfoRes = await fetch("https://bobonboard.urtestsite.com/agents/reminders/submit-agent-info", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!agentInfoRes.ok) throw new Error(`Agent info submission failed: ${agentInfoRes.status}`);
      const agentData = await agentInfoRes.json();
      console.log("Agent info submitted:", agentData);

      const agentId = agentData.agent_id;
      if (!agentId) throw new Error("Agent ID not received");

      const additionalEndpoints = [
        { endpoint: `/agents/reminders/fill-mw507/${agentId}`, method: "POST", payload },
        { endpoint: `/agents/reminders/agent/${agentId}/w4-form`, method: "GET" },
        { endpoint: `/agents/reminders/agent/${agentId}/background-check`, method: "GET" },
        { endpoint: `/agents/reminders/agent/${agentId}/direct-deposit`, method: "GET" },
        { endpoint: `/agents/reminders/agent/${agentId}/i9`, method: "GET" },
        { endpoint: `/agents/reminders/agent/${agentId}/employment-agreement`, method: "GET" },
        { endpoint: `/agents/reminders/agent/${agentId}/handbook`, method: "GET" },
        { endpoint: `/agents/reminders/agent/${agentId}/intake-license`, method: "GET" },
        // Add the new payroll quickhire endpoint
        { endpoint: `/agents/reminders/payroll/quickhire/${agentId}`, method: "POST" },
        { endpoint: `/agents/reminders/agent/${agentId}/push-to-sheet`, method: "POST" },
        { endpoint: `/agents/reminders/download-onboarding-file`, method: "GET" },
      ];

      const additionalRequests = additionalEndpoints.map(async ({ endpoint, method, payload }) => {
        console.log(`Sending ${method} request to ${endpoint}...`);
        try {
          const fetchOptions: RequestInit = {
            method,
            headers: { accept: "application/json" },
          };
          if (method === "POST") {
            fetchOptions.headers = {
              ...fetchOptions.headers,
              "Content-Type": "application/json",
            };
            fetchOptions.body = JSON.stringify(payload);
          }

          const res = await fetch(`https://bobonboard.urtestsite.com${endpoint}`, fetchOptions);
          console.log(`Response from ${endpoint}:`, res.ok);

          if (!res.ok) throw new Error(`Request to ${endpoint} failed: ${res.status}`);
          const data = await res.json();
          console.log(`Response from ${endpoint}:`, data);
          return { endpoint, status: "success", data };
        } catch (error) {
          console.error(`Error in ${endpoint}:`, error);
          return { endpoint, status: "error", error };
        }
      });

      const results = await Promise.all(additionalRequests);

      const failedRequests = results.filter(result => result.status === "error");
      if (failedRequests.length > 0) {
        console.warn("Some additional requests failed:", failedRequests);
        throw new Error(`Some additional requests failed: ${failedRequests.map(r => r.endpoint).join(", ")}`);
      }

      // ✅ Collect all download URLs with file names
      const downloadFiles = results
        .map(result => {
          const fileUrl = result.data?.download_url;
          const fileName = result.data?.file_name;

          if (fileUrl && fileName) {
            // Format file name for display: "Intake license Information"
            const formattedName = fileName
              .replace(/_/g, " ")          // replace underscores with spaces
              .replace(/\.\w+$/, "")       // remove extension
              .replace(/\b\w/g, (c: string) => c.toUpperCase()); // capitalize each word

            return {
              url: fileUrl,
              name: formattedName,
            };
          }
          return null;
        })
        .filter(Boolean); // remove null entries

      console.log("📁 Collected download files:", downloadFiles);

      setSubmitStatus("success");
      setSubmitMessage("Submission received. All documents processed successfully. We will contact you shortly.");

      // ✅ Redirect with all URLs + names encoded as JSON
      router.push(`/thank-you?download_files=${encodeURIComponent(JSON.stringify(downloadFiles))}`);

    } catch (err) {
      console.error("Submission failed", err);
      setSubmitStatus("error");
      setSubmitMessage("Submission failed. Please try again or contact support.");
    }

  }

  const progress = (currentStep / 5) * 100

  // Automatically load existing signature when entering Step 4
  useEffect(() => {
    if (currentStep === 4 && sigCanvasRef.current && formData.signatureData) {
      sigCanvasRef.current.fromDataURL(formData.signatureData);
    }
  }, [currentStep, formData.signatureData]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-blue-200 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Onboarding Portal</h1>
              <p className="text-gray-600">Complete your registration and required documents to get started.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-white border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Progress</CardTitle>
                <Progress value={progress} className="w-full [&>div]:bg-blue-500" />
                <p className="text-sm text-gray-600">Step {currentStep} of 5</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {steps.map((step) => {
                  const Icon = step.icon
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${currentStep === step.id
                          ? "bg-blue-100 text-blue-900"
                          : currentStep > step.id
                            ? "bg-gray-100 text-gray-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{step.title}</span>
                      {currentStep > step.id && (
                        <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
                          <CheckCircle className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  Step {currentStep}: {steps[currentStep - 1]?.title || "Unknown"}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {currentStep === 1 && "Please provide your personal information."}
                  {currentStep === 2 && "Upload your professional credentials and certifications."}
                  {currentStep === 3 && "Enter your banking, compensation, and tax location details."}
                  {currentStep === 4 && "Complete tax forms, I-9 verification, and sign agreements."}
                  {currentStep === 5 && "Review all information before submitting."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => updateFormData("fullName", e.target.value)}
                          placeholder="John Michael Doe"
                          className={errors.fullName ? "border-red-500 focus:border-red-500" : ""}
                        />
                        {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
                        {/* {!errors.fullName && formData.fullName && (
                        <p className="text-xs text-gray-600">This name will be used for your e-signature in Step 4</p>
                      )} */}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          max={new Date(Date.now() - 86400000).toISOString().split("T")[0]}
                          onChange={(e) => {
                            const value = e.target.value;

                            const selected = new Date(value);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            if (selected >= today) return; // silently block invalid selection
                            updateFormData("dateOfBirth", value);
                          }}
                        />

                        {errors.dateOfBirth && <p className="text-xs text-red-600">{errors.dateOfBirth}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => {
                            const value = e.target.value;

                            // Allow only digits, spaces, parentheses, plus, and hyphen
                            if (!/^[0-9+\-\s()]*$/.test(value)) return;

                            // Remove all non-digit characters
                            const digits = value.replace(/\D/g, "");

                            // Basic auto-format for US numbers (+1)
                            let formatted = "";
                            if (digits.startsWith("1") && digits.length > 1) {
                              // Example: +1 (555) 123-4567
                              formatted = "+1 ";
                              const area = digits.slice(1, 4);
                              const prefix = digits.slice(4, 7);
                              const line = digits.slice(7, 11);

                              if (area) formatted += `(${area}`;
                              if (area && area.length === 3) formatted += `) `;
                              if (prefix) formatted += prefix;
                              if (prefix && prefix.length === 3) formatted += `-`;
                              if (line) formatted += line;
                            } else {
                              // If no +1 prefix, just format normally
                              const area = digits.slice(0, 3);
                              const prefix = digits.slice(3, 6);
                              const line = digits.slice(6, 10);

                              if (area) formatted += `(${area}`;
                              if (area && area.length === 3) formatted += `) `;
                              if (prefix) formatted += prefix;
                              if (prefix && prefix.length === 3) formatted += `-`;
                              if (line) formatted += line;
                            }

                            updateFormData("phoneNumber", formatted.trim());
                          }}
                          placeholder="+1 (555) 123-4567"
                        />

                        {errors.phoneNumber && <p className="text-xs text-red-600">{errors.phoneNumber}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          placeholder="your.email@example.com"
                        />
                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Residential Address</h3>
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          value={formData.street}
                          onChange={(e) => updateFormData("street", e.target.value)}
                          placeholder="123 Main Street"
                        />
                        {errors.street && <p className="text-xs text-red-600">{errors.street}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow only alphabets and spaces
                              if (/^[A-Za-z\s]*$/.test(value)) {
                                updateFormData("city", value);
                              }
                            }}
                            placeholder="New York"
                          />
                          {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow only alphabets (no spaces for state abbreviations like NY, CA)
                              if (/^[A-Za-z]*$/.test(value)) {
                                updateFormData("state", value.toUpperCase()); // optional: auto uppercase
                              }
                            }}
                            placeholder="NY"
                          />
                          {errors.state && <p className="text-xs text-red-600">{errors.state}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zip">ZIP Code *</Label>
                          <Input
                            id="zip"
                            value={formData.zip}
                            onChange={(e) => updateFormData("zip", e.target.value)}
                            placeholder="10001"
                          />
                          {errors.zip && <p className="text-xs text-red-600">{errors.zip}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <Select
                            value={formData.country = "us"}
                            onValueChange={(value) => updateFormData("country", value)}
                            disabled
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">United States</SelectItem>
                            </SelectContent>
                          </Select>

                          {errors.country && <p className="text-xs text-red-600">{errors.country}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Professional Credentials */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nationalId">National ID / SSN *</Label>
                        <Input
                          id="nationalId"
                          value={formData.nationalId}
                          onChange={(e) => updateFormData("nationalId", e.target.value)}
                          placeholder="XXX-XX-XXXX"
                        />
                        {errors.nationalId && <p className="text-xs text-red-600">{errors.nationalId}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxId">Tax ID / EIN</Label>
                        <Input
                          id="taxId"
                          value={formData.taxId}
                          onChange={(e) => updateFormData("taxId", e.target.value)}
                          placeholder="XX-XXXXXXX"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">State License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => updateFormData("licenseNumber", e.target.value)}
                        placeholder="Enter license or certification number"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Document Uploads</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-dashed border-2 border-blue-300 hover:border-blue-400 transition-colors bg-white">
                          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <input
                              type="file"
                              ref={idInputRef}
                              onChange={handleIdUpload}
                              accept="image/*,application/pdf"
                              style={{ display: "none" }}
                            />
                            <Upload className="w-8 h-8 text-gray-500 mb-2" />
                            <p className="text-sm font-medium text-gray-900">Upload ID Document</p>
                            <p className="text-xs text-gray-600">PDF, JPG, PNG (max 5MB)</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => idInputRef.current?.click()}
                              className="mt-2 border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                            >
                              Choose File
                            </Button>
                            {formData.idDocument && (
                              <p className="text-xs text-green-600 mt-2">Selected: {formData.idDocument.name}</p>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="border-dashed border-2 border-blue-300 hover:border-blue-400 transition-colors bg-white">
                          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <input
                              type="file"
                              ref={certInputRef}
                              onChange={handleCertUpload}
                              accept="image/*,application/pdf"
                              style={{ display: "none" }}
                            />
                            <Upload className="w-8 h-8 text-gray-500 mb-2" />
                            <p className="text-sm font-medium text-gray-900">Upload Certifications</p>
                            <p className="text-xs text-gray-600">PDF, JPG, PNG (max 5MB)</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => certInputRef.current?.click()}
                              className="mt-2 border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                            >
                              Choose File
                            </Button>
                            {formData.certifications && (
                              <p className="text-xs text-green-600 mt-2">Selected: {formData.certifications.name}</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Enhanced Banking, Compensation & Tax Location */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Banking Details */}
                    <Card className="bg-white border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-900">Banking & Payment Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bankName">Bank Name *</Label>
                            <Input
                              id="bankName"
                              value={formData.bankName}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow only alphabets and spaces
                                if (/^[A-Za-z\s]*$/.test(value)) {
                                  updateFormData("bankName", value);
                                }
                              }}
                              placeholder="Chase Bank"
                            />

                            {errors.bankName && <p className="text-xs text-red-600">{errors.bankName}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Preferred Payment Method *</Label>
                            <Select
                              value={formData.paymentMethod = "bank-transfer"}
                              onValueChange={(value) => updateFormData("paymentMethod", value)}
                              disabled
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                              </SelectContent>
                            </Select>

                            {errors.paymentMethod && <p className="text-xs text-red-600">{errors.paymentMethod}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number / IBAN *</Label>
                            <Input
                              id="accountNumber"
                              value={formData.accountNumber}
                              onChange={(e) => updateFormData("accountNumber", e.target.value)}
                              placeholder="XXXX-XXXX-XXXX-1234"
                            />
                            {errors.accountNumber && <p className="text-xs text-red-600">{errors.accountNumber}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="routingNumber">Routing Number / SWIFT Code *</Label>
                            <Input
                              id="routingNumber"
                              value={formData.routingNumber}
                              onChange={(e) => updateFormData("routingNumber", e.target.value)}
                              placeholder="021000021"
                            />
                            {errors.routingNumber && <p className="text-xs text-red-600">{errors.routingNumber}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Compensation Details */}
                    {/* <Card className="bg-white border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900">Compensation Details *</CardTitle>
                      <CardDescription>Configure your pay structure and salary information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="payGroupId">Pay Group</Label>
                          <Select value={formData.payGroupId} onValueChange={(value) => updateFormData("payGroupId", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pay group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="806">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payTypeId">Pay Type *</Label>
                          <Select value={formData.payTypeId} onValueChange={(value) => updateFormData("payTypeId", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pay type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="4">1099</SelectItem>
                              <SelectItem value="3">Auto Hourly</SelectItem>
                              <SelectItem value="5">Commission</SelectItem>
                              <SelectItem value="D">Daily</SelectItem>
                              <SelectItem value="1">Hourly</SelectItem>
                              <SelectItem value="2">Salary</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.payTypeId && <p className="text-xs text-red-600">{errors.payTypeId}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="frequencyId">Pay Frequency *</Label>
                          <Select value={formData.frequencyId} onValueChange={(value) => updateFormData("frequencyId", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Annually</SelectItem>
                              <SelectItem value="26">Bi-Weekly</SelectItem>
                              <SelectItem value="12">Monthly</SelectItem>
                              <SelectItem value="4">Quarterly</SelectItem>
                              <SelectItem value="24">Semi-Monthly</SelectItem>
                              <SelectItem value="52">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.frequencyId && <p className="text-xs text-red-600">{errors.frequencyId}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="normalHours">Normal Hours per Week</Label>
                          <Input
                            id="normalHours"
                            type="number"
                            value={formData.normalHours}
                            onChange={(e) => updateFormData("normalHours", e.target.value)}
                            placeholder="40"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="annualSalary">Annual Salary</Label>
                          <Input
                            id="annualSalary"
                            type="number"
                            value={formData.annualSalary}
                            onChange={(e) => updateFormData("annualSalary", e.target.value)}
                            placeholder="85000"
                          />
                          {errors.annualSalary && <p className="text-xs text-red-600">{errors.annualSalary}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="perPaySalary">Per Pay Salary</Label>
                          <Input
                            id="perPaySalary"
                            type="number"
                            value={formData.perPaySalary}
                            onChange={(e) => updateFormData("perPaySalary", e.target.value)}
                            placeholder="3269.23"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hourlyRate">Hourly Rate</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            step="0.01"
                            value={formData.hourlyRate}
                            onChange={(e) => updateFormData("hourlyRate", e.target.value)}
                            placeholder="40.50"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card> */}

                    {/* Tax Location */}
                    {/* <Card className="bg-white border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900">Tax Location Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vertexGeoCode">Residence Location (Vertex Geo Code) *</Label>
                          <Input
                            id="vertexGeoCode"
                            maxLength={9}
                            value={formData.vertexGeoCode}
                            onChange={(e) => updateFormData("vertexGeoCode", e.target.value)}
                            placeholder="123456789"
                          />
                          {errors.vertexGeoCode && <p className="text-xs text-red-600">{errors.vertexGeoCode}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="psdCode">Resident PSD Code</Label>
                          <Input
                            id="psdCode"
                            value={formData.psdCode}
                            onChange={(e) => updateFormData("psdCode", e.target.value)}
                            placeholder="PSD12345"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card> */}

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Secure Information</p>
                            <p className="text-xs text-gray-600">All financial and tax information is encrypted and stored securely.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Step 4: Enhanced Tax Forms, Federal Tax, I-9 & Agreements */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Federal Income Tax */}
                    {/* <Card className="bg-white border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900">Federal Income Tax Withholding</CardTitle>
                      <CardDescription>Complete your W-4 tax withholding information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="federalFilingStatusId">Filing Status</Label>
                          <Select value={formData.federalFilingStatusId} onValueChange={(value) => updateFormData("federalFilingStatusId", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select filing status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FDH">Head of Household</SelectItem>
                              <SelectItem value="FDM2">Married Filing Jointly or Qualifying Widow(er)</SelectItem>
                              <SelectItem value="FDS2">Single or Married Filing Separately</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="federalIsBlocked"
                            checked={formData.federalIsBlocked}
                            onCheckedChange={(checked) => updateFormData("federalIsBlocked", checked as boolean)}
                          />
                          <Label htmlFor="federalIsBlocked" className="text-sm">Block Federal Tax Withholding</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="federalMultipleJobs"
                            checked={formData.federalMultipleJobs}
                            onCheckedChange={(checked) => updateFormData("federalMultipleJobs", checked as boolean)}
                          />
                          <Label htmlFor="federalMultipleJobs" className="text-sm">Multiple Jobs or Spouse Works</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="federalDependentExemption">Dependents Amount</Label>
                          <Input
                            id="federalDependentExemption"
                            type="number"
                            value={formData.federalDependentExemption}
                            onChange={(e) => updateFormData("federalDependentExemption", e.target.value)}
                            placeholder="500.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="federalAdditionalIncome">Other Income Amount</Label>
                          <Input
                            id="federalAdditionalIncome"
                            type="number"
                            value={formData.federalAdditionalIncome}
                            onChange={(e) => updateFormData("federalAdditionalIncome", e.target.value)}
                            placeholder="1000.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="federalDeductionExemption">Deductions Amount</Label>
                          <Input
                            id="federalDeductionExemption"
                            type="number"
                            value={formData.federalDeductionExemption}
                            onChange={(e) => updateFormData("federalDeductionExemption", e.target.value)}
                            placeholder="2000.00"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card> */}

                    {/* I-9 Information */}
                    {/* <Card className="bg-white border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900">I-9 Employment Eligibility</CardTitle>
                      <CardDescription>Complete Form I-9 verification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="isI9Completed"
                          checked={formData.isI9Completed}
                          onCheckedChange={(checked) => updateFormData("isI9Completed", checked as boolean)}
                        />
                        <Label htmlFor="isI9Completed" className="text-sm font-medium">I-9 Form Completed *</Label>
                      </div>
                      {errors.isI9Completed && <p className="text-xs text-red-600">{errors.isI9Completed}</p>}
                      {formData.isI9Completed && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="i9CompletionDate">I-9 Completion Date *</Label>
                            <Input
                              id="i9CompletionDate"
                              type="date"
                              value={formData.i9CompletionDate}
                              onChange={(e) => updateFormData("i9CompletionDate", e.target.value)}
                            />
                            {errors.i9CompletionDate && <p className="text-xs text-red-600">{errors.i9CompletionDate}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="citizenshipId">Citizenship Status *</Label>
                            <Select value={formData.citizenshipId} onValueChange={(value) => updateFormData("citizenshipId", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select citizenship status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Citizen of the United States</SelectItem>
                                <SelectItem value="2">Alien Authorized to Work</SelectItem>
                                <SelectItem value="3">Lawful Permanent Resident</SelectItem>
                                <SelectItem value="4">Unknown</SelectItem>
                                <SelectItem value="5">National of the United States</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.citizenshipId && <p className="text-xs text-red-600">{errors.citizenshipId}</p>}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card> */}

                    {/* Required Documents & Agreements */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
                      <div className="space-y-3">
                        <Card className="bg-white border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <div>
                                  <p className="font-medium text-gray-900">Tax Form W-9</p>
                                  <p className="text-sm text-gray-600">Required for tax reporting</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="taxForm"
                                  checked={formData.taxFormSigned}
                                  onCheckedChange={(checked) => updateFormData("taxFormSigned", checked as boolean)}
                                />
                                <Label htmlFor="taxForm" className="text-sm text-gray-900">Completed</Label>
                              </div>
                              {errors.taxFormSigned && <p className="text-xs text-red-600 mt-2">{errors.taxFormSigned}</p>}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-white border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <div>
                                  <p className="font-medium text-gray-900">Employee Agreement</p>
                                  <p className="text-sm text-gray-600">Terms and conditions of employment</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="employeeAgreement"
                                  checked={formData.employeeAgreementSigned}
                                  onCheckedChange={(checked) => updateFormData("employeeAgreementSigned", checked as boolean)}
                                />
                                <Label htmlFor="employeeAgreement" className="text-sm text-gray-900">Signed</Label>
                              </div>
                              {errors.employeeAgreementSigned && <p className="text-xs text-red-600 mt-2">{errors.employeeAgreementSigned}</p>}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-white border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <div>
                                  <p className="font-medium text-gray-900">Employee Contract</p>
                                  <p className="text-sm text-gray-600">Legal employment contract</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="contract"
                                  checked={formData.contractSigned}
                                  onCheckedChange={(checked) => updateFormData("contractSigned", checked as boolean)}
                                />
                                <Label htmlFor="contract" className="text-sm text-gray-900">Signed</Label>
                              </div>
                              {errors.contractSigned && <p className="text-xs text-red-600 mt-2">{errors.contractSigned}</p>}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Electronic Signature */}
                    <Card className="bg-white border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">Electronic Signature *</CardTitle>
                        <CardDescription>
                          Draw your signature in the box below. This constitutes your legal electronic signature.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Signature Canvas */}
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-1 bg-gray-50">
                          <SignatureCanvas
                            ref={sigCanvasRef}
                            canvasProps={{
                              className: `w-full h-48 bg-white rounded-md border border-gray-300 ${errors.signatureData ? 'border-red-500' : ''
                                }`,
                            }}
                            onEnd={() => getSignatureData()}
                            penColor="rgb(0, 0, 0)"
                            backgroundColor="rgb(255, 255, 255)"
                            minWidth={1}
                            maxWidth={3}
                            dotSize={1}
                            throttle={16}
                          />
                        </div>

                        {errors.signatureData && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.signatureData}
                          </p>
                        )}

                        {!errors.signatureData && formData.signatureData && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Signature captured successfully
                          </p>
                        )}

                        {/* Signature Controls */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearSignature}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Clear Signature
                          </Button>
                          {/* <Button
        variant="outline"
        size="sm"
        onClick={() => sigCanvasRef.current?.fromDataURL(formData.signatureData || '')}
        disabled={!formData.signatureData}
        className="border-blue-300 text-blue-600 hover:bg-blue-50"
      >
        Redraw
      </Button> */}
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <div className="flex items-start space-x-2">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium text-gray-900 mb-1">
                                Legal Notice
                              </p>
                              <p className="text-gray-700">
                                By drawing your signature above, you certify that this electronic signature is your
                                legally binding signature, equivalent to a handwritten signature. It will be used to
                                sign all required documents including tax forms, employment agreements, and contracts.
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                <strong>Tip:</strong> Use your mouse, trackpad, or touch screen to draw your full
                                signature clearly. You can clear and redraw as needed.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Fallback for devices without canvas support */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 hidden">
                          <p className="text-sm text-yellow-800">
                            Signature pad not supported on this device. Please use a device with mouse/touch support.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Step 5: Review & Submit */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Review Your Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-base text-gray-900">Personal Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm text-gray-700">
                            <div><strong>Name:</strong> {formData.fullName || "Not provided"}</div>
                            <div><strong>Email:</strong> {formData.email || "Not provided"}</div>
                            <div><strong>Phone:</strong> {formData.phoneNumber || "Not provided"}</div>
                            <div>
                              <strong>Address:</strong>{" "}
                              {formData.street
                                ? `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`
                                : "Not provided"}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-base text-gray-900">Professional Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm text-gray-700">
                            <div>
                              <strong>National ID:</strong>{" "}
                              {formData.nationalId ? `***-**-${formData.nationalId.slice(-4)}` : "Not provided"}
                            </div>
                            <div><strong>Tax ID:</strong> {formData.taxId || "Not provided"}</div>
                            <div><strong>License:</strong> {formData.licenseNumber || "Not provided"}</div>
                            <div><strong>ID Document:</strong> {formData.idDocument ? formData.idDocument.name : "Not provided"}</div>
                            <div><strong>Certifications:</strong> {formData.certifications ? formData.certifications.name : "Not provided"}</div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-base text-gray-900">Compensation & Banking</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm text-gray-700">
                            <div><strong>Bank:</strong> {formData.bankName || "Not provided"}</div>
                            <div>
                              <strong>Account:</strong>{" "}
                              {formData.accountNumber ? `****${formData.accountNumber.slice(-4)}` : "Not provided"}
                            </div>
                            <div><strong>Pay Type:</strong> {formData.payTypeId || "Not provided"}</div>
                            <div><strong>Annual Salary:</strong> ${formData.annualSalary || "Not provided"}</div>
                            <div><strong>Frequency:</strong> {formData.frequencyId || "Not provided"}</div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-base text-gray-900">Tax & Compliance Status</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className={`w-4 h-4 ${formData.taxFormSigned ? "text-blue-500" : "text-gray-400"}`} />
                              <span>Tax Form W-9</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className={`w-4 h-4 ${formData.employeeAgreementSigned ? "text-blue-500" : "text-gray-400"}`} />
                              <span>Employee Agreement</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className={`w-4 h-4 ${formData.contractSigned ? "text-blue-500" : "text-gray-400"}`} />
                              <span>Employee Contract</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className={`w-4 h-4 ${formData.isI9Completed ? "text-blue-500" : "text-gray-400"}`} />
                              <span>I-9 Form</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className={`w-4 h-4 ${formData.signatureData ? "text-blue-500" : "text-gray-400"}`} />
                              <span>Electronic Signature {formData.signatureData ? "✓ Completed" : "⚠ Required"}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Card className="border-blue-300 bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="confirmAccuracy"
                            checked={formData.confirmAccuracy}
                            onCheckedChange={(checked) => updateFormData("confirmAccuracy", checked as boolean)}
                          />
                          <div className="space-y-1">
                            <Label htmlFor="confirmAccuracy" className="text-sm font-medium cursor-pointer text-gray-900">
                              I confirm all information is accurate
                            </Label>
                            <p className="text-xs text-gray-600">
                              By checking this box, you certify that all information provided is true and accurate to the best of your knowledge.
                            </p>
                          </div>
                          {errors.confirmAccuracy && <p className="text-xs text-red-600 mt-2">{errors.confirmAccuracy}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-blue-200">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                  >
                    Previous
                  </Button>

                  {currentStep < 5 ? (
                    <Button onClick={nextStep} className="bg-blue-500 hover:bg-blue-600 text-white">
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!formData.confirmAccuracy || submitStatus === "submitting"}
                      className={`bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 ${submitStatus === "submitting" ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                    >
                      {submitStatus === "submitting" && (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      {submitStatus === "submitting" ? "Submitting..." : "Submit & Sign"}
                    </Button>
                  )}
                </div>

                {submitStatus === "success" && <p className="text-sm text-green-600">{submitMessage}</p>}
                {submitStatus === "error" && <p className="text-sm text-red-600">{submitMessage}</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}