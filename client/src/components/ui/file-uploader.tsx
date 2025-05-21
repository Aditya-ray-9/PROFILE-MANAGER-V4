import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useFormContext } from "react-hook-form";

interface FileUploaderProps {
  profileId?: number;
}

interface DocumentFile {
  id: number;
  name: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export default function DocumentsForm({ profileId }: FileUploaderProps) {
  const { watch } = useFormContext();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();
  
  // Watch form values for profile ID if not directly provided
  const formValues = watch();
  const effectiveProfileId = profileId || (formValues?.id as number | undefined);
  
  // Fetch documents if profile ID is available
  const { data: documents } = useQuery({
    queryKey: [`/api/profiles/${effectiveProfileId}/documents`],
    enabled: !!effectiveProfileId,
  });
  
  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, name, profileId }: { file: File, name: string, profileId: number }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      
      // Simulated progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[file.name] || 0;
          if (currentProgress < 90) {
            return { ...prev, [file.name]: currentProgress + 10 };
          }
          return prev;
        });
      }, 300);
      
      try {
        const response = await fetch(`/api/profiles/${profileId}/documents`, {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        
        clearInterval(progressInterval);
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        return response.json();
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: () => {
      if (effectiveProfileId) {
        queryClient.invalidateQueries({ queryKey: [`/api/profiles/${effectiveProfileId}/documents`] });
      }
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      if (effectiveProfileId) {
        queryClient.invalidateQueries({ queryKey: [`/api/profiles/${effectiveProfileId}/documents`] });
      }
      toast({
        title: "Document deleted",
        description: "The document has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete document: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (!effectiveProfileId) {
      toast({
        title: "Cannot upload documents",
        description: "Please save the profile first before adding documents.",
        variant: "destructive",
      });
      return;
    }
    
    // Upload each file
    files.forEach(file => {
      uploadDocumentMutation.mutate({
        file,
        name: file.name,
        profileId: effectiveProfileId
      });
    });
    
    // Clear selected files after upload
    setFiles([]);
  };
  
  // Handle document deletion
  const handleDeleteDocument = (documentId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocumentMutation.mutate(documentId);
    }
  };
  
  // Get file size display
  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Get icon for file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return 'ri-image-line';
    } else if (fileType.includes('pdf')) {
      return 'ri-file-pdf-line';
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return 'ri-file-word-line';
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return 'ri-file-excel-line';
    } else {
      return 'ri-file-line';
    }
  };
  
  // Document list or placeholder
  const renderDocumentList = () => {
    if (!effectiveProfileId) {
      return (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <p>Save the profile to add documents</p>
        </div>
      );
    }
    
    if (!documents || documents.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="ri-file-add-line text-xl text-gray-400"></i>
          </div>
          <p>No documents attached yet</p>
          <p className="text-sm">Upload files to attach them to this profile</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {documents.map((doc: DocumentFile) => (
          <Card key={doc.id} className="overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                  <i className={`${getFileIcon(doc.fileType)} text-xl`}></i>
                </div>
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getFileSize(doc.fileSize)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-500 h-8 w-8 p-0">
                  <i className="ri-download-line"></i>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-red-500 h-8 w-8 p-0"
                  onClick={() => handleDeleteDocument(doc.id)}
                >
                  <i className="ri-delete-bin-line"></i>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render files being uploaded
  const renderUploadingFiles = () => {
    if (files.length === 0) return null;
    
    return (
      <div className="space-y-3 mt-4">
        {files.map((file, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                    <i className={`${getFileIcon(file.type)} text-xl`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 h-8 w-8 p-0"
                  onClick={() => {
                    setFiles(files.filter((_, i) => i !== index));
                  }}
                >
                  <i className="ri-close-line"></i>
                </Button>
              </div>
              
              {uploadProgress[file.name] && (
                <Progress value={uploadProgress[file.name]} className="h-1" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">Documents</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Attach files and documents to this profile
          </p>
        </div>
        
        {renderDocumentList()}
        {renderUploadingFiles()}
        
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
            <Label htmlFor="document-upload" className="cursor-pointer block">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                <i className="ri-upload-cloud-line text-2xl text-gray-400"></i>
              </div>
              <p className="mb-1 font-medium">Click to upload or drop files</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, DOCX, XLS, JPG, PNG up to 10MB
              </p>
              <Input
                id="document-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </Label>
          </div>
          
          {files.length > 0 && (
            <Button onClick={handleUpload} disabled={!effectiveProfileId || uploadDocumentMutation.isPending}>
              {uploadDocumentMutation.isPending ? "Uploading..." : "Upload Files"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
