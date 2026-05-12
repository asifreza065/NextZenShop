import React, { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { X, UploadCloud, Image as ImageIcon, ArrowLeft, Eye, Edit, Tag, Box, Settings, Truck, Search, Focus } from 'lucide-react';
import { MAIN_CATEGORIES } from '../../lib/categories';
import { formatPrice } from '../../lib/utils';

interface ProductFormProps {
  product?: any;
  onClose: () => void;
  onSave: () => void;
}

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    shortDescription: product?.shortDescription || '',
    description: product?.description || '',
    brand: product?.brand || '',
    sku: product?.sku || '',
    tags: product?.tags?.join(', ') || '',
    
    price: product?.price || '',
    salePrice: product?.salePrice || product?.discountPrice || '',
    discountPercentage: product?.discountPercentage || '',
    costPrice: product?.costPrice || '',
    
    stock: product?.stock || 0,
    stockStatus: product?.stockStatus || 'in_stock',
    lowStockWarning: product?.lowStockWarning || '',
    barcode: product?.barcode || '',
    
    categoryId: product?.categoryId || MAIN_CATEGORIES[0].id,
    subCategory: product?.subCategory || '',
    childCategory: product?.childCategory || '',
    
    videoUrl: product?.videoUrl || '',
    
    specifications: {
      ram: product?.specifications?.ram || '',
      storage: product?.specifications?.storage || '',
      processor: product?.specifications?.processor || '',
      display: product?.specifications?.display || '',
      battery: product?.specifications?.battery || '',
      camera: product?.specifications?.camera || '',
      color: product?.specifications?.color || '',
      weight: product?.specifications?.weight || '',
      dimensions: product?.specifications?.dimensions || '',
    },
    
    shipping: {
      weight: product?.shipping?.weight || '',
      cost: product?.shipping?.cost || '',
      freeShipping: product?.shipping?.freeShipping || false,
    },
    
    seo: {
      metaTitle: product?.seo?.metaTitle || '',
      metaDescription: product?.seo?.metaDescription || '',
      keywords: product?.seo?.keywords || '',
    },
    
    status: product?.status || 'Published',
    isFeatured: product?.isFeatured || false,
    isTrending: product?.isTrending || false,
  });

  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const selectedCategoryObj = MAIN_CATEGORIES.find(c => c.id === formData.categoryId);
  const availableSubcategories = selectedCategoryObj?.subcategories || [];

  useEffect(() => {
    if (availableSubcategories.length > 0 && !availableSubcategories.includes(formData.subCategory)) {
      setFormData(prev => ({ ...prev, subCategory: availableSubcategories[0] }));
    }
  }, [formData.categoryId, availableSubcategories]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && formData.name && !formData.slug) {
      const generatedSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [specField]: value }
      }));
    } else if (name.startsWith('shipping.')) {
      const shipField = name.split('.')[1];
      const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setFormData(prev => ({
        ...prev,
        shipping: { ...prev.shipping, [shipField]: val }
      }));
    } else if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, [seoField]: value }
      }));
    } else {
      const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    
    setUploadingFiles(imageFiles);
    
    const uploadedUrls: string[] = [];
    for (const file of imageFiles) {
      try {
        const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setImages(prev => [...prev, ...uploadedUrls]);
    setUploadingFiles([]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Please fill all required fields');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price as string),
        discountPrice: formData.salePrice ? parseFloat(formData.salePrice as string) : null,
        stock: parseInt(formData.stock as string, 10),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        images,
        rating: product?.rating || 0,
        reviewCount: product?.reviewCount || 0,
        updatedAt: Date.now(),
      };

      if (isEditing) {
        await updateDoc(doc(db, 'products', product.id), productData);
        toast.success('Product updated successfully');
      } else {
        const newDocRef = doc(collection(db, 'products'));
        await setDoc(newDocRef, {
          ...productData,
          id: newDocRef.id,
          createdAt: Date.now(),
        });
        toast.success('Product created successfully');
      }
      onSave();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <Tag className="w-4 h-4" /> },
    { id: 'media', label: 'Media', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing & Inventory', icon: <Box className="w-4 h-4" /> },
    { id: 'specs', label: 'Specifications', icon: <Settings className="w-4 h-4" /> },
    { id: 'shipping', label: 'Shipping & SEO', icon: <Truck className="w-4 h-4" /> },
  ];

  if (previewMode) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Product Preview</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(false)}>
              <Edit className="w-4 h-4 mr-2" /> Edit Details
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Publish Product'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4 border border-gray-200">
               {images.length > 0 ? (
                 <img src={images[0]} alt={formData.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                   <ImageIcon className="w-16 h-16 opacity-20 mb-2" />
                   <p>No image</p>
                 </div>
               )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mb-3">
              <span>{selectedCategoryObj?.name}</span>
              {formData.subCategory && <span>/ {formData.subCategory}</span>}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.name || 'Product Title'}</h1>
            {formData.brand && <p className="text-gray-500 mb-4">Brand: {formData.brand}</p>}
            
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(formData.salePrice ? Number(formData.salePrice) : Number(formData.price) || 0)}
              </span>
              {formData.salePrice && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(Number(formData.price))}
                </span>
              )}
            </div>
            
            <div className="prose prose-sm text-gray-600 mb-8 whitespace-pre-wrap">
              {formData.description || 'No description provided.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button onClick={handleSubmit} disabled={loading || uploadingFiles.length > 0}>
            {loading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4">Product Status</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status" 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                  className="w-full mt-1.5 rounded-md border border-gray-300 p-2 text-sm"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isFeatured" 
                  name="isFeatured" 
                  checked={formData.isFeatured} 
                  onChange={handleInputChange}
                  className="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">Featured Product</Label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isTrending" 
                  name="isTrending" 
                  checked={formData.isTrending} 
                  onChange={handleInputChange}
                  className="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <Label htmlFor="isTrending" className="cursor-pointer">Trending Product</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
              <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Title *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Sony WH-1000XM4" required />
                  </div>
                  <div>
                    <Label htmlFor="slug">Product Slug</Label>
                    <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="sony-wh-1000xm4" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} placeholder="Brief summary of the product" />
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Detailed product description..." className="h-40" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Sony" />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="SNY-XM4" />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="audio, wireless, noise-canceling" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <Label htmlFor="categoryId">Main Category *</Label>
                    <select 
                      id="categoryId" 
                      name="categoryId" 
                      value={formData.categoryId} 
                      onChange={handleInputChange}
                      className="w-full mt-1.5 rounded-md border border-gray-300 p-2 text-sm"
                      required
                    >
                      {MAIN_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="subCategory">Subcategory</Label>
                    <select 
                      id="subCategory" 
                      name="subCategory" 
                      value={formData.subCategory} 
                      onChange={handleInputChange}
                      className="w-full mt-1.5 rounded-md border border-gray-300 p-2 text-sm"
                    >
                      <option value="">Select Subcategory</option>
                      {availableSubcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="childCategory">Child Category</Label>
                    <Input id="childCategory" name="childCategory" value={formData.childCategory} onChange={handleInputChange} placeholder="e.g. Over-Ear" className="mt-1" />
                  </div>
                </div>
              </div>
            </div>

            <div className={activeTab === 'media' ? 'block' : 'hidden'}>
              <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>
                
                <div>
                  <Label className="mb-2 block">Product Images *</Label>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop images here</p>
                      <p className="text-xs text-gray-500 mb-4">PNG, JPG, WEBP up to 5MB</p>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        id="image-upload" 
                        onChange={handleFileInput} 
                      />
                      <label htmlFor="image-upload">
                        <Button type="button" variant="outline" className="pointer-events-none">Select Files</Button>
                      </label>
                    </div>
                  </div>

                  {(images.length > 0 || uploadingFiles.length > 0) && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {images.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[10px] uppercase font-bold text-center py-1">
                              Primary Thumbnail
                            </span>
                          )}
                        </div>
                      ))}
                      {uploadingFiles.map((file, i) => (
                        <div key={`uploading-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <span className="text-xs text-gray-500 font-medium truncate w-full px-2 text-center">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Label htmlFor="videoUrl">Product Video URL</Label>
                  <Input id="videoUrl" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="e.g. YouTube or Vimeo link" className="mt-1" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'pricing' ? 'block' : 'hidden'}>
              <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Regular Price ($) *</Label>
                    <Input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Sale Price ($)</Label>
                    <Input id="salePrice" name="salePrice" type="number" min="0" step="0.01" value={formData.salePrice} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                    <Input id="discountPercentage" name="discountPercentage" type="number" min="0" max="100" value={formData.discountPercentage} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="costPrice">Cost Price ($)</Label>
                    <Input id="costPrice" name="costPrice" type="number" min="0" step="0.01" value={formData.costPrice} onChange={handleInputChange} />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8 pt-6 border-t border-gray-100">Inventory</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="stockStatus">Stock Status</Label>
                    <select 
                      id="stockStatus" 
                      name="stockStatus" 
                      value={formData.stockStatus} 
                      onChange={handleInputChange}
                      className="w-full mt-1.5 rounded-md border border-gray-300 p-2 text-sm"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="on_backorder">On Backorder</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lowStockWarning">Low Stock Warning</Label>
                    <Input id="lowStockWarning" name="lowStockWarning" type="number" min="0" value={formData.lowStockWarning} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Barcode (UPC/EAN/ISBN)</Label>
                    <Input id="barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            </div>

            <div className={activeTab === 'specs' ? 'block' : 'hidden'}>
              <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Specifications</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specifications.processor">Processor</Label>
                    <Input id="specifications.processor" name="specifications.processor" value={formData.specifications.processor} onChange={handleInputChange} placeholder="e.g. Apple M2, Intel i7" />
                  </div>
                  <div>
                    <Label htmlFor="specifications.ram">RAM</Label>
                    <Input id="specifications.ram" name="specifications.ram" value={formData.specifications.ram} onChange={handleInputChange} placeholder="e.g. 16GB LPDDR5" />
                  </div>
                  <div>
                    <Label htmlFor="specifications.storage">Storage</Label>
                    <Input id="specifications.storage" name="specifications.storage" value={formData.specifications.storage} onChange={handleInputChange} placeholder="e.g. 512GB SSD" />
                  </div>
                  <div>
                    <Label htmlFor="specifications.display">Display</Label>
                    <Input id="specifications.display" name="specifications.display" value={formData.specifications.display} onChange={handleInputChange} placeholder="e.g. 15.6 inch 4K OLED" />
                  </div>
                  <div>
                    <Label htmlFor="specifications.battery">Battery</Label>
                    <Input id="specifications.battery" name="specifications.battery" value={formData.specifications.battery} onChange={handleInputChange} placeholder="e.g. 4000mAh" />
                  </div>
                  <div>
                    <Label htmlFor="specifications.camera">Camera</Label>
                    <Input id="specifications.camera" name="specifications.camera" value={formData.specifications.camera} onChange={handleInputChange} placeholder="e.g. 50MP Main + 12MP Ultra Wide" />
                  </div>
                  <div>
                    <Label htmlFor="specifications.color">Color Options</Label>
                    <Input id="specifications.color" name="specifications.color" value={formData.specifications.color} onChange={handleInputChange} placeholder="e.g. Midnight Black, Pearl White" />
                  </div>
                  <div>
                    <Label htmlFor="specifications.weight">Weight</Label>
                    <Input id="specifications.weight" name="specifications.weight" value={formData.specifications.weight} onChange={handleInputChange} placeholder="e.g. 1.2 kg" />
                  </div>
                  <div>
                    <Label className="col-span-full" htmlFor="specifications.dimensions">Dimensions</Label>
                    <Input id="specifications.dimensions" name="specifications.dimensions" value={formData.specifications.dimensions} onChange={handleInputChange} placeholder="e.g. 30 x 20 x 1.5 cm" />
                  </div>
                </div>
              </div>
            </div>

            <div className={activeTab === 'shipping' ? 'block' : 'hidden'}>
              <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping.weight">Package Weight (kg/lb)</Label>
                    <Input id="shipping.weight" name="shipping.weight" value={formData.shipping.weight} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="shipping.cost">Flat Shipping Cost ($)</Label>
                    <Input id="shipping.cost" name="shipping.cost" type="number" min="0" step="0.01" value={formData.shipping.cost} onChange={handleInputChange} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="shipping.freeShipping" 
                    name="shipping.freeShipping" 
                    checked={formData.shipping.freeShipping} 
                    onChange={handleInputChange}
                    className="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <Label htmlFor="shipping.freeShipping" className="cursor-pointer">Enable Free Shipping</Label>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8 pt-6 border-t border-gray-100">SEO Settings</h3>

                <div>
                  <Label htmlFor="seo.metaTitle">Meta Title</Label>
                  <Input id="seo.metaTitle" name="seo.metaTitle" value={formData.seo.metaTitle} onChange={handleInputChange} placeholder="SEO optimized title" />
                </div>
                
                <div>
                  <Label htmlFor="seo.metaDescription">Meta Description</Label>
                  <Textarea id="seo.metaDescription" name="seo.metaDescription" value={formData.seo.metaDescription} onChange={handleInputChange} placeholder="Brief description for search engines..." className="h-20" />
                </div>
                
                <div>
                  <Label htmlFor="seo.keywords">SEO Keywords (comma separated)</Label>
                  <Input id="seo.keywords" name="seo.keywords" value={formData.seo.keywords} onChange={handleInputChange} placeholder="headphones, noise canceling, wireless" />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

