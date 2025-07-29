'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';

type UserType = 'household' | 'helper';
type VerificationStatus = 'pending' | 'verified' | 'rejected';
type DocumentType = 'id' | 'address_proof' | 'reference' | 'certificate';

interface VerificationRequest {
  id?: string;
  user_id: string;
  document_type: DocumentType;
  document_url: string;
  status: VerificationStatus;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export default function Verification() {
  const router = useRouter();
  const supabase = createClientClient();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  
  // Document upload states
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [addressDocument, setAddressDocument] = useState<File | null>(null);
  const [referenceDocument, setReferenceDocument] = useState<File | null>(null);
  const [certificateDocument, setCertificateDocument] = useState<File | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('You must be logged in to verify your account');
        }
        
        setUserId(user.id);
        
        // Check if user has a helper profile
        const { data: helperProfile, error: helperError } = await supabase
          .from('helper_profiles')
          .select('verification_status')
          .eq('user_id', user.id)
          .single();
        
        // Check if user has a household profile
        const { data: householdProfile, error: householdError } = await supabase
          .from('household_profiles')
          .select('verification_status')
          .eq('user_id', user.id)
          .single();
        
        if (helperProfile) {
          setUserType('helper');
          setVerificationStatus(helperProfile.verification_status);
        } else if (householdProfile) {
          setUserType('household');
          setVerificationStatus(householdProfile.verification_status);
        } else {
          // No profile found, redirect to profile setup
          router.push('/profile-setup');
          return;
        }
        
        // Fetch existing verification requests
        const { data: requests, error: requestsError } = await supabase
          .from('verification_requests')
          .select('*')
          .eq('user_id', user.id);
        
        if (!requestsError && requests) {
          setVerificationRequests(requests);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [supabase, router]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const uploadDocument = async (file: File, documentType: DocumentType) => {
    if (!userId) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${documentType}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `verification/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
    
    if (uploadError) {
      throw uploadError;
    }
    
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    
    return data.publicUrl;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !userType) return;
    
    try {
      setUploading(true);
      setError(null);
      
      const requests: VerificationRequest[] = [];
      
      // Upload ID document
      if (idDocument) {
        const documentUrl = await uploadDocument(idDocument, 'id');
        if (documentUrl) {
          requests.push({
            user_id: userId,
            document_type: 'id',
            document_url: documentUrl,
            status: 'pending',
          });
        }
      }
      
      // Upload address proof
      if (addressDocument) {
        const documentUrl = await uploadDocument(addressDocument, 'address_proof');
        if (documentUrl) {
          requests.push({
            user_id: userId,
            document_type: 'address_proof',
            document_url: documentUrl,
            status: 'pending',
          });
        }
      }
      
      // Upload reference letter (if helper)
      if (userType === 'helper' && referenceDocument) {
        const documentUrl = await uploadDocument(referenceDocument, 'reference');
        if (documentUrl) {
          requests.push({
            user_id: userId,
            document_type: 'reference',
            document_url: documentUrl,
            status: 'pending',
          });
        }
      }
      
      // Upload certificates (if helper)
      if (userType === 'helper' && certificateDocument) {
        const documentUrl = await uploadDocument(certificateDocument, 'certificate');
        if (documentUrl) {
          requests.push({
            user_id: userId,
            document_type: 'certificate',
            document_url: documentUrl,
            status: 'pending',
          });
        }
      }
      
      // Save verification requests to database
      if (requests.length > 0) {
        const { error } = await supabase
          .from('verification_requests')
          .insert(requests);
        
        if (error) throw error;
        
        // Update profile verification status to pending
        if (userType === 'helper') {
          await supabase
            .from('helper_profiles')
            .update({ verification_status: 'pending' })
            .eq('user_id', userId);
        } else {
          await supabase
            .from('household_profiles')
            .update({ verification_status: 'pending' })
            .eq('user_id', userId);
        }
        
        setVerificationStatus('pending');
        setVerificationRequests(prev => [...prev, ...requests]);
        
        // Reset file inputs
        setIdDocument(null);
        setAddressDocument(null);
        setReferenceDocument(null);
        setCertificateDocument(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };
  
  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block mb-4">
          {error}
        </div>
        <button 
          onClick={() => router.push('/dashboard')} 
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Account Verification</h1>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
        
        {/* Verification Status */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
          
          <div className="flex items-center">
            <div 
              className={`w-3 h-3 rounded-full mr-2 ${
                verificationStatus === 'verified' ? 'bg-green-500' :
                verificationStatus === 'rejected' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}
            />
            <span className="font-medium">
              {verificationStatus === 'verified' ? 'Verified' :
               verificationStatus === 'rejected' ? 'Verification Rejected' :
               'Verification Pending'}
            </span>
          </div>
          
          {verificationStatus === 'pending' && (
            <p className="mt-2 text-gray-600">
              Your verification is being reviewed. This process typically takes 1-3 business days.
            </p>
          )}
          
          {verificationStatus === 'rejected' && (
            <p className="mt-2 text-gray-600">
              Your verification was rejected. Please submit new documents or contact support for assistance.
            </p>
          )}
          
          {verificationStatus === 'verified' && (
            <p className="mt-2 text-gray-600">
              Your account is fully verified. You can now access all features of HouseHelp.ng.
            </p>
          )}
        </div>
        
        {/* Submitted Documents */}
        {verificationRequests.length > 0 && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Submitted Documents</h2>
            
            <div className="divide-y">
              {verificationRequests.map((request) => (
                <div key={request.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {request.document_type === 'id' ? 'ID Document' :
                       request.document_type === 'address_proof' ? 'Address Proof' :
                       request.document_type === 'reference' ? 'Reference Letter' :
                       'Certificate'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Submitted: {new Date(request.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div 
                    className={`px-3 py-1 rounded-full text-xs ${
                      request.status === 'verified' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Upload Documents Form */}
        {verificationStatus !== 'verified' && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Verification Documents</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="id-document" className="label">
                  ID Document (Required)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Upload a clear photo of your government-issued ID (National ID, Driver's License, or International Passport).
                </p>
                <input
                  id="id-document"
                  type="file"
                  accept="image/*, application/pdf"
                  onChange={(e) => handleFileChange(e, setIdDocument)}
                  className="input py-2"
                  required={verificationRequests.every(req => req.document_type !== 'id')}
                />
              </div>
              
              <div>
                <label htmlFor="address-document" className="label">
                  Proof of Address (Required)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Upload a utility bill, bank statement, or any official document showing your current address.
                </p>
                <input
                  id="address-document"
                  type="file"
                  accept="image/*, application/pdf"
                  onChange={(e) => handleFileChange(e, setAddressDocument)}
                  className="input py-2"
                  required={verificationRequests.every(req => req.document_type !== 'address_proof')}
                />
              </div>
              
              {userType === 'helper' && (
                <>
                  <div>
                    <label htmlFor="reference-document" className="label">
                      Reference Letter (Recommended)
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Upload a reference letter from a previous employer or character reference.
                    </p>
                    <input
                      id="reference-document"
                      type="file"
                      accept="image/*, application/pdf"
                      onChange={(e) => handleFileChange(e, setReferenceDocument)}
                      className="input py-2"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="certificate-document" className="label">
                      Certificates or Qualifications (Optional)
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Upload any relevant certificates, training documents, or qualifications.
                    </p>
                    <input
                      id="certificate-document"
                      type="file"
                      accept="image/*, application/pdf"
                      onChange={(e) => handleFileChange(e, setCertificateDocument)}
                      className="input py-2"
                    />
                  </div>
                </>
              )}
              
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={uploading || (!idDocument && !addressDocument && !referenceDocument && !certificateDocument)}
              >
                {uploading ? 'Uploading Documents...' : 'Submit Documents'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}