'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { Upload, Eye, Send, Image as ImageIcon, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function CreateNewsletterContent() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('General');
  const [author, setAuthor] = useState('Unknown');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'published' | 'draft' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsletterId = searchParams.get('id');

  useEffect(() => {
    if (newsletterId) {
      const fetchNewsletter = async () => {
        try {
          const docRef = doc(db, 'newsletters', newsletterId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || '');
            setContent(data.content || '');
            setImageUrl(data.imageUrl || null);
            setImage(data.imageUrl || null); // Use Cloudinary URL for preview
            setCategory(data.category || 'General');
            setAuthor(data.author || 'Unknown');
            setCurrentStatus(data.status || 'draft');
          } else {
            toast.error('Newsletter not found');
            router.push('/admin/newsletters');
          }
        } catch (err: unknown) {
          console.error('Fetch newsletter error:', err);
          toast.error('Failed to load newsletter');
        }
      };
      fetchNewsletter();
    }
  }, [newsletterId, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size exceeds 10MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('Only JPG, PNG, or GIF images are supported');
      return;
    }
    setIsUploading(true);
    try {
      // Sanitize file name
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .replace(/-+/g, '-');
      const formData = new FormData();
      formData.append('file', file, sanitizedFileName);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('resource_type', 'image');
      formData.append('public_id', `newsletter_${Date.now()}`);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        setImage(data.secure_url); // Use Cloudinary URL for preview
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('No secure_url in Cloudinary response');
      }
    } catch (err: unknown) {
      console.error('Image upload error:', err);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const saveNewsletter = async (status: 'published' | 'draft') => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    try {
      const newsletterData = {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl || null,
        category: category.trim() || 'General',
        author: author.trim() || 'Unknown',
        status,
        publishedAt: status === 'published' ? new Date() : null,
        updatedAt: new Date(),
        subscribers: 0,
        replies: 0,
      };
      if (newsletterId) {
        const docRef = doc(db, 'newsletters', newsletterId);
        await updateDoc(docRef, newsletterData);
        toast.success(`Newsletter ${status === 'published' ? 'published' : 'updated as draft'} successfully`);
      } else {
        await addDoc(collection(db, 'newsletters'), newsletterData);
        toast.success(`Newsletter ${status === 'published' ? 'published' : 'saved as draft'} successfully`);
      }
      setTitle('');
      setContent('');
      setImage(null);
      setImageUrl(null);
      setCategory('General');
      setAuthor('Unknown');
      setCurrentStatus(null);
      router.push('/admin/newsletters');
    } catch (err: unknown) {
      console.error('Save newsletter error:', err);
      toast.error(`Failed to ${newsletterId ? 'update' : 'save'} newsletter`);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await saveNewsletter('published');
    setIsPublishing(false);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    await saveNewsletter('draft');
    setIsSavingDraft(false);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    await saveNewsletter(currentStatus || 'draft');
    setIsUpdating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-playfair font-bold text-black dark:text-white">
          {newsletterId ? 'Edit Newsletter' : 'Create Newsletter'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Craft or update your newsletter.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-300 dark:border-gray-600 p-8"
      >
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
            Newsletter Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your newsletter title..."
            className="w-full px-4 py-4 text-2xl font-playfair border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 transition-colors dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter newsletter category..."
            className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 transition-colors dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
            Author
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name..."
            className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 transition-colors dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
            Featured Image
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
            {image ? (
              <div className="space-y-4">
                <img
                  src={image}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg"
                  onError={() => {
                    console.warn('Failed to load preview image');
                    toast.error('Failed to display image preview');
                    setImage(null);
                  }}
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setImageUrl(null);
                  }}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">Drop your image here, or</p>
                  <label className="inline-flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose file
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  JPG, PNG, or GIF up to 10MB
                </p>
                {isUploading && (
                  <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your newsletter content here..."
            rows={12}
            className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 transition-colors dark:bg-gray-700 dark:text-white resize-none"
          />
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
            Supports Markdown formatting. Preview before publishing.
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-300 dark:border-gray-600">
          <button className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <div className="flex items-center space-x-4">
            {newsletterId ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdate}
                disabled={isUpdating || !title.trim() || !content.trim()}
                className="flex items-center px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Newsletter
                  </>
                )}
              </motion.button>
            ) : (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || !title.trim() || !content.trim()}
                  className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePublish}
                  disabled={isPublishing || !title.trim() || !content.trim()}
                  className="flex items-center px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  {isPublishing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publish Newsletter
                    </>
                  )}
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CreateNewsletter() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">Loading...</div>}>
        <CreateNewsletterContent />
      </Suspense>
    </AdminLayout>
  );
}