import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Download, Upload, Printer, Sparkles, Check, 
  X, Search, Filter, RefreshCw, AlertCircle, CheckCircle2, ChevronRight, 
  ChevronLeft, ArrowUpDown, ChevronDown, Copy, Flame, EyeOff, Save, Undo2,
  Camera
} from 'lucide-react';
import { MenuItem, CustomConfig } from '../types';
import * as XLSX from 'xlsx';

interface AdvancedMenuManagerProps {
  menu: MenuItem[];
  onUpdateMenu: (updatedMenu: MenuItem[]) => void;
  config: CustomConfig;
}

export default function AdvancedMenuManager({ menu, onUpdateMenu, config }: AdvancedMenuManagerProps) {
  // Spreadsheet / Live States
  const [items, setItems] = useState<MenuItem[]>([]);
  const [originalItems, setOriginalItems] = useState<MenuItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  
  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterAvailability, setFilterAvailability] = useState<string>('All');
  const [filterFoodType, setFilterFoodType] = useState<string>('All');
  const [filterFeatured, setFilterFeatured] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof MenuItem | 'sortOrder'>('sortOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Modals & Panels Toggles
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState<boolean>(false);
  
  // Single-Item Form States
  const [formName, setFormName] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formCategory, setFormCategory] = useState<MenuItem['category']>('Lunch');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formImg, setFormImg] = useState<string>('');
  const [formIsAvailable, setFormIsAvailable] = useState<boolean>(true);
  const [formFoodType, setFormFoodType] = useState<MenuItem['foodType']>('Veg');
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);
  const [formPrepTime, setFormPrepTime] = useState<string>('20 mins');
  const [isAIGenerating, setIsAIGenerating] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string>('');
  
  // Bulk Actions
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState<number>(10);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<MenuItem['category']>('Lunch');
  
  // Smart Drop Image & Compressor States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkImgInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imagesCompressionConsole, setImagesCompressionConsole] = useState<string>('');
  
  // Import Files Validation Reports
  const [importReport, setImportReport] = useState<{
    valid: any[];
    invalid: { row: number; item: string; errors: string[] }[];
    summary: { total: number; validCount: number; invalidCount: number; duplicatesDetected: number };
  } | null>(null);
  const [importOptionDuplicate, setImportOptionDuplicate] = useState<'update' | 'skip' | 'duplicate'>('update');
  const [rawImportData, setRawImportData] = useState<any[]>([]);

  // Draft Auto-save Indicators
  const [lastAutoSaved, setLastAutoSaved] = useState<string>('');
  const [draftExists, setDraftExists] = useState<boolean>(false);

  // Sync state initially
  useEffect(() => {
    if (menu && menu.length > 0) {
      // Set sortOrder defaults if not initialized yet
      const mapped = menu.map((m, idx) => ({
        ...m,
        sortOrder: m.sortOrder !== undefined ? m.sortOrder : idx + 1,
        foodType: m.foodType ? m.foodType : (m.isVeg ? 'Veg' : 'Non-Veg'),
        isPopular: m.isPopular !== undefined ? m.isPopular : false
      }));
      setItems(mapped);
      setOriginalItems(JSON.parse(JSON.stringify(mapped)));
    }
  }, [menu]);

  // Track manual changes made locally
  useEffect(() => {
    const stringifiedCurrent = JSON.stringify(items);
    const stringifiedOriginal = JSON.stringify(originalItems);
    if (items.length > 0 && originalItems.length > 0) {
      setHasChanges(stringifiedCurrent !== stringifiedOriginal);
    }
  }, [items, originalItems]);

  // Draft Restore Checklist on Start
  useEffect(() => {
    const savedDraft = localStorage.getItem('bhagwati_draft_recipes_v2');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          setDraftExists(true);
        }
      } catch (e) {
        console.error("Draft parsing failed:", e);
      }
    }
  }, []);

  // background 30 seconds auto-save
  useEffect(() => {
    if (!hasChanges || items.length === 0) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      localStorage.setItem('bhagwati_draft_recipes_v2', JSON.stringify({
        items: items,
        savedAt: Date.now()
      }));
      setLastAutoSaved(timestamp);
      setDraftExists(false); // Since we just updated it or retrieved it
    }, 30000);

    return () => clearInterval(interval);
  }, [hasChanges, items]);

  const handleRestoreDraft = () => {
    const savedDraft = localStorage.getItem('bhagwati_draft_recipes_v2');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && Array.isArray(parsed.items)) {
          setItems(parsed.items);
          setHasChanges(true);
          const now = new Date(parsed.savedAt || Date.now());
          setLastAutoSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setDraftExists(false);
          alert("Culinary draft successfully restored into your active Excel grid!");
        }
      } catch (e) {
        alert("Could not load draft cleanly.");
      }
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem('bhagwati_draft_recipes_v2');
    setDraftExists(false);
  };

  // Image Compressor (Resolves 413 error payload size limits beautifully inside Node and local DB)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max side dimension to minimize byte size while keeping amazing visual identity
          const max_side = 400; 
          if (width > max_side || height > max_side) {
            if (width > height) {
              height = Math.round((height * max_side) / width);
              width = max_side;
            } else {
              width = Math.round((width * max_side) / height);
              height = max_side;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // High fidelity image compression -> produces very light (~15kb) image strings
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
            resolve(compressedBase64);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Drag & Drop Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDropSingle = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file);
        setFormImg(compressed);
      } else {
        alert("Please drop a valid image file (JPG, PNG, WEBP).");
      }
    }
  };

  const handleFormFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const compressed = await compressImage(file);
      setFormImg(compressed);
    }
  };

  // Multi Image Bulk Upload Matches items in the grid based on file name or lets users apply
  const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files) as File[];
      let successCount = 0;
      let matchedCount = 0;
      
      setImagesCompressionConsole("Compressing and matching images. Please wait...");

      const updatedItems = [...items];

      for (const file of filesArr) {
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImage(file);
        successCount++;
        
        // Strip file extension to find matching item names
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')).toLowerCase().trim();
        
        const matchedIndex = updatedItems.findIndex(x => 
          x.name.toLowerCase().includes(cleanName) || cleanName.includes(x.name.toLowerCase())
        );

        if (matchedIndex !== -1) {
          updatedItems[matchedIndex].image = compressed;
          updatedItems[matchedIndex].lastUpdated = new Date().toISOString().split('T')[0];
          matchedCount++;
        }
      }

      setItems(updatedItems);
      setImagesCompressionConsole(`Successfully compressed ${successCount} images. Matched ${matchedCount} items based on filenames.`);
      setTimeout(() => setImagesCompressionConsole(''), 8000);
    }
  };

  // Standard Categories for validation and dropdowns
  const categoriesList: MenuItem['category'][] = [
    'Breakfast', 'Lunch', 'Dinner', 'Daily Tiffin', 'Special Thali', 'Snacks', 'Beverages'
  ];

  // Excel Paste Hook (Ctrl+V parsing for fast spreadsheet management)
  const handlePasteInSpreadsheet = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = e.clipboardData.getData('text');
    if (!clipboardData) return;

    const rows = clipboardData.split(/\r?\n/).filter(r => r.trim() !== '');
    if (rows.length === 0) return;

    // Check if pasted data has headers, skip header if detected
    const firstRowCols = rows[0].split('\t');
    const hasHeader = firstRowCols.some(col => 
      ['name', 'dish', 'item', 'price', 'category', 'description'].includes(col.toLowerCase().trim())
    );

    const startIndex = hasHeader ? 1 : 0;
    const itemsToInsert: MenuItem[] = [];

    for (let i = startIndex; i < rows.length; i++) {
      const columns = rows[i].split('\t');
      if (columns.length < 2) continue; // Needs at least Name and Price parameters

      const pastedName = columns[0].trim();
      const pastedPrice = parseFloat(columns[1]) || 120;
      const pastedCategory = (columns[2]?.trim() || 'Lunch') as MenuItem['category'];
      const pastedDesc = columns[3]?.trim() || `${pastedName} crafted fresh in Pune.`;
      const pastedFoodType = (columns[4]?.trim() || 'Veg') as MenuItem['foodType'];
      const pastedIsAvailable = columns[2]?.toLowerCase() === 'no' || columns[5]?.toLowerCase() === 'no' ? false : true;

      const validatedCategory = categoriesList.includes(pastedCategory) ? pastedCategory : 'Lunch';
      const validatedFoodType: MenuItem['foodType'] = ['Veg', 'Non-Veg', 'Vegan'].includes(pastedFoodType) ? pastedFoodType : 'Veg';

      itemsToInsert.push({
        id: 'pasted-' + Math.floor(Math.random() * 1000000),
        name: pastedName,
        price: pastedPrice,
        category: validatedCategory,
        description: pastedDesc,
        foodType: validatedFoodType,
        isVeg: validatedFoodType !== 'Non-Veg',
        isAvailable: pastedIsAvailable,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop',
        isPopular: false,
        prepTime: '20 mins',
        sortOrder: items.length + itemsToInsert.length + 1,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }

    if (itemsToInsert.length > 0) {
      setItems([...items, ...itemsToInsert]);
      alert(`Successfully pasted & created ${itemsToInsert.length} new items from clipboard!`);
    }
  };

  // Live Inline Editing of Table fields
  const handleCellEdit = (itemId: string, field: keyof MenuItem | 'foodType', value: any) => {
    const updated = items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        // Sync isVeg boolean state when editing foodType
        if (field === 'foodType') {
          updatedItem.isVeg = value !== 'Non-Veg';
        }
        if (field === 'isPopular') {
          updatedItem.isPopular = value;
        }
        updatedItem.lastUpdated = new Date().toISOString().split('T')[0];
        return updatedItem;
      }
      return item;
    });
    setItems(updated);
  };

  // Delete Individual Recipe
  const handleDeleteItemLocally = (id: string) => {
    if (confirm("Are you sure you want to remove this culinary recipe from lists?")) {
      setItems(items.filter(x => x.id !== id));
      setSelectedIds(selectedIds.filter(x => x !== id));
    }
  };

  // Add Item Click
  const handleAddNewItemClick = () => {
    setEditingItem(null);
    setFormName('');
    setFormPrice('');
    setFormCategory('Lunch');
    setFormDesc('');
    setFormImg('');
    setFormIsAvailable(true);
    setFormFoodType('Veg');
    setFormIsFeatured(false);
    setFormPrepTime('20 mins');
    setIsAddingNew(true);
  };

  // Edit Item Modal Launch
  const handleEditItemLocally = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPrice(item.price);
    setFormCategory(item.category);
    setFormDesc(item.description);
    setFormImg(item.image);
    setFormIsAvailable(item.isAvailable);
    setFormFoodType(item.foodType || (item.isVeg ? 'Veg' : 'Non-Veg'));
    setFormIsFeatured(item.isPopular || false);
    setFormPrepTime(item.prepTime || '20 mins');
    setIsAddingNew(true);
  };

  // Gemini Descriptions Builder inside form
  const handleAIGenerator = async () => {
    if (!formName.trim()) {
      setAiMessage("Write a recipe dish name above so Gemini knows what description to craft!");
      return;
    }
    setIsAIGenerating(true);
    setAiMessage("Gemini copywriter thinking...");
    try {
      const res = await fetch('/api/gemini/suggest-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          category: formCategory,
          isVeg: formFoodType !== 'Non-Veg'
        })
      });
      const data = await res.json();
      setFormDesc(data.text);
      setAiMessage("Gemini crafted a descriptive menu text! Read below.");
    } catch (e) {
      setAiMessage("Gemini copywriter is resting. Drafted standard narrative.");
      setFormDesc(`${formName} brings you pure, aromatic rich notes crafted lovingly under authentic methods by Pune head chefs.`);
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Form Save Action
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      // Update existing item
      const updated = items.map(x => {
        if (x.id === editingItem.id) {
          return {
            ...x,
            name: formName.trim(),
            price: Number(formPrice),
            category: formCategory,
            description: formDesc.trim() || `${formName} cooked freshly in Pune.`,
            image: formImg.trim(),
            isAvailable: formIsAvailable,
            foodType: formFoodType,
            isVeg: formFoodType !== 'Non-Veg',
            isPopular: formIsFeatured,
            prepTime: formPrepTime,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return x;
      });
      setItems(updated);
    } else {
      // Create new item
      const newItem: MenuItem = {
        id: 'm-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: formName.trim(),
        price: Number(formPrice),
        category: formCategory,
        description: formDesc.trim() || `${formName} cooked freshly in Pune.`,
        image: formImg.trim(),
        isAvailable: formIsAvailable,
        foodType: formFoodType,
        isVeg: formFoodType !== 'Non-Veg',
        isPopular: formIsFeatured,
        prepTime: formPrepTime,
        sortOrder: items.length + 1,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setItems([...items, newItem]);
    }

    setIsAddingNew(false);
    setEditingItem(null);
  };

  // Quick Insertion Row directly in spreadsheet
  const handleSpreadsheetAddRow = () => {
    const newId = 'm-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const newItem: MenuItem = {
      id: newId,
      name: `New Recipe Dish ${items.length + 1}`,
      price: 150,
      category: 'Lunch',
      description: 'Cooked fresh with local Indian spices.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop',
      isAvailable: true,
      isVeg: true,
      foodType: 'Veg',
      isPopular: false,
      prepTime: '20 mins',
      sortOrder: items.length + 1,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setItems([...items, newItem]);
    
    // Jump pagination to accommodate the new row
    const totalPages = Math.ceil((items.length + 1) / pageSize);
    setCurrentPage(totalPages);
  };

  // --- EXCEL & CSV EXPORT ---
  const handleExportData = (format: 'xlsx' | 'csv') => {
    const selectedItems = selectedIds.length > 0 
      ? items.filter(x => selectedIds.includes(x.id))
      : items;

    const exportRows = selectedItems.map(item => ({
      'Item Name': item.name,
      'Category': item.category,
      'Description': item.description,
      'Price (₹)': item.price,
      'Food Type': item.foodType || (item.isVeg ? 'Veg' : 'Non-Veg'),
      'Availability': item.isAvailable ? 'In Stock' : 'Out of Stock',
      'Featured Item': item.isPopular ? 'Featured' : 'Regular',
      'Prep Time': item.prepTime || '20 mins',
      'Image URL': item.image.startsWith('data:') ? 'Image Base64 Encoded Source' : item.image,
      'Last Updated': item.lastUpdated || 'Initial System Setup'
    }));

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Culinary Menu Listing');
      XLSX.writeFile(workbook, `Bhagwati_Kitchen_Menu_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
      // Build pure RFC4180 CSV
      const headers = ['Item Name', 'Category', 'Description', 'Price (INR)', 'Food Type', 'Availability', 'Featured', 'Image URL'];
      const csvContent = [
        headers.join(','),
        ...exportRows.map(row => [
          `"${row['Item Name'].replace(/"/g, '""')}"`,
          `"${row['Category']}"`,
          `"${row['Description'].replace(/"/g, '""')}"`,
          row['Price (₹)'],
          `"${row['Food Type']}"`,
          `"${row['Availability']}"`,
          `"${row['Featured Item']}"`,
          `"${row['Image URL']}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Bhagwati_Kitchen_Menu_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // --- SPREADSHEET EXCEL / CSV BULK IMPORT ---
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const workbook = XLSX.read(bstr, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length <= 1) {
            alert("The uploaded spreadsheet contains no recognizable recipe rows.");
            return;
          }

          setRawImportData(jsonData);
          processImportData(jsonData);
        } catch (err) {
          alert("Error parsing file. Ensure it is a valid Excel format (.xlsx) or CSV (.csv)");
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  const processImportData = (rawRows: any[]) => {
    // Recognize standard headers
    const headers = rawRows[0].map((h: any) => h?.toString().toLowerCase().trim());
    
    // Find column index mappings or fallbacks
    const indexName = headers.findIndex((h: string) => h.includes('name') || h.includes('dish') || h.includes('title'));
    const indexCategory = headers.findIndex((h: string) => h.includes('cat'));
    const indexDesc = headers.findIndex((h: string) => h.includes('desc') || h.includes('info'));
    const indexPrice = headers.findIndex((h: string) => h.includes('price') || h.includes('cost') || h.includes('rate'));
    const indexFoodType = headers.findIndex((h: string) => h.includes('type') || h.includes('veg'));
    const indexAvailable = headers.findIndex((h: string) => h.includes('avail') || h.includes('stock'));
    const indexImg = headers.findIndex((h: string) => h.includes('image') || h.includes('img') || h.includes('pic') || h.includes('url'));

    const validatedItems: any[] = [];
    const invalidRows: { row: number; item: string; errors: string[] }[] = [];
    let duplicatesCount = 0;

    for (let r = 1; r < rawRows.length; r++) {
      const currentRow = rawRows[r];
      if (currentRow.length === 0 || !currentRow.some((c: any) => c !== null && c !== '')) continue;

      const emailDishName = indexName !== -1 ? currentRow[indexName]?.toString().trim() : '';
      const emailCategory = indexCategory !== -1 ? currentRow[indexCategory]?.toString().trim() : 'Lunch';
      const emailDesc = indexDesc !== -1 ? currentRow[indexDesc]?.toString().trim() : 'Delightful flavor cooked fresh.';
      const emailPriceRaw = indexPrice !== -1 ? parseFloat(currentRow[indexPrice]) : NaN;
      const emailFoodType = indexFoodType !== -1 ? currentRow[indexFoodType]?.toString().trim() : 'Veg';
      const emailImg = indexImg !== -1 ? currentRow[indexImg]?.toString().trim() : 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop';
      const emailAvailableRaw = indexAvailable !== -1 ? currentRow[indexAvailable]?.toString().toLowerCase() : 'yes';

      const rowErrors: string[] = [];

      // Validate Dish Name
      if (!emailDishName) {
        rowErrors.push("Dish Name is empty or missing.");
      }

      // Validate Price 
      if (isNaN(emailPriceRaw)) {
        rowErrors.push("Price tag must be a valid numeric price.");
      } else if (emailPriceRaw < 10) {
        rowErrors.push("Culinary pricing is critically low. Mini limit ₹10.");
      }

      // Validate Category
      const mappedCategory = categoriesList.find(c => c.toLowerCase() === emailCategory.toLowerCase()) || 'Lunch';
      if (!categoriesList.some(c => c.toLowerCase() === emailCategory.toLowerCase())) {
        // Soft correction warning
        console.warn(`Standardized category fallback used for ${emailDishName}`);
      }

      // Validate Food Type
      let normFoodType: MenuItem['foodType'] = 'Veg';
      if (emailFoodType.toLowerCase().includes('non') || emailFoodType.toLowerCase().includes('chicken') || emailFoodType.toLowerCase().includes('meat')) {
        normFoodType = 'Non-Veg';
      } else if (emailFoodType.toLowerCase().includes('vegan')) {
        normFoodType = 'Vegan';
      }

      const normAvailable = emailAvailableRaw.includes('no') || emailAvailableRaw.includes('out') || emailAvailableRaw === 'false' ? false : true;

      // Duplicate Check against active items
      const isDuplicate = items.some(x => x.name.toLowerCase() === emailDishName.toLowerCase());
      if (isDuplicate) {
        duplicatesCount++;
      }

      if (rowErrors.length > 0) {
        invalidRows.push({
          row: r + 1,
          item: emailDishName || `Row ${r + 1}`,
          errors: rowErrors
        });
      } else {
        validatedItems.push({
          name: emailDishName,
          category: mappedCategory,
          description: emailDesc,
          price: emailPriceRaw,
          foodType: normFoodType,
          isVeg: normFoodType !== 'Non-Veg',
          isAvailable: normAvailable,
          image: emailImg,
          isPopular: false,
          prepTime: '20 mins',
          isDuplicate: isDuplicate
        });
      }
    }

    setImportReport({
      valid: validatedItems,
      invalid: invalidRows,
      summary: {
        total: rawRows.length - 1,
        validCount: validatedItems.length,
        invalidCount: invalidRows.length,
        duplicatesDetected: duplicatesCount
      }
    });
  };

  // Perform Final Database Bulk Insertion
  const handleCommitBulkImport = () => {
    if (!importReport) return;

    let updatedList = [...items];
    let inserted = 0;
    let updated = 0;

    importReport.valid.forEach(importedItem => {
      const matchIndex = updatedList.findIndex(existing => existing.name.toLowerCase() === importedItem.name.toLowerCase());

      if (matchIndex !== -1) {
        if (importOptionDuplicate === 'update') {
          updatedList[matchIndex] = {
            ...updatedList[matchIndex],
            ...importedItem,
            id: updatedList[matchIndex].id, // Keep exact ID of target
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          updated++;
        } else if (importOptionDuplicate === 'duplicate') {
          updatedList.push({
            ...importedItem,
            id: 'm-bulk-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
            name: `${importedItem.name} (Copy)`,
            sortOrder: updatedList.length + 1,
            lastUpdated: new Date().toISOString().split('T')[0]
          });
          inserted++;
        }
        // If "skip", do nothing
      } else {
        updatedList.push({
          ...importedItem,
          id: 'm-bulk-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
          sortOrder: updatedList.length + 1,
          lastUpdated: new Date().toISOString().split('T')[0]
        });
        inserted++;
      }
    });

    setItems(updatedList);
    setIsBulkImportOpen(false);
    setImportReport(null);
    setRawImportData([]);
    alert(`Bulk operations summary: Inserted ${inserted} new items, Overwrote ${updated} matching menu records!`);
  };

  // Download official CSV template
  const handleDownloadTemplate = () => {
    const csvHeaderLine = "Item Name,Category,Description,Price,Food Type,Availability,Image URL";
    const sampleRows = [
      'Kashmiri Rajma Masala,Lunch,"Slow simmered red kidney beans in authentic spice blend.",165,Veg,yes,"https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop"',
      'Chicken Tikka Lahori,Dinner,"Glow tandoor roasted chicken thighs marinated with yoghurt.",260,Non-Veg,yes,"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop"'
    ];
    const fullCsv = [csvHeaderLine, ...sampleRows].join('\n');
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bhagwati_Kitchen_Bulk_Import_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- BULK ACTION DISPATCHERS ---
  const handleBulkDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you completely sure you want to permanently delete all ${selectedIds.length} selected items?`)) {
      setItems(items.filter(x => !selectedIds.includes(x.id)));
      setSelectedIds([]);
    }
  };

  const handleBulkChangeCategory = () => {
    if (selectedIds.length === 0) return;
    const updated = items.map(x => {
      if (selectedIds.includes(x.id)) {
        return { ...x, category: bulkCategoryTarget, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return x;
    });
    setItems(updated);
    setSelectedIds([]);
    alert(`Category updated to ${bulkCategoryTarget} for ${selectedIds.length} items.`);
  };

  const handleBulkEditAvailability = (val: boolean) => {
    if (selectedIds.length === 0) return;
    const updated = items.map(x => {
      if (selectedIds.includes(x.id)) {
        return { ...x, isAvailable: val, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return x;
    });
    setItems(updated);
    setSelectedIds([]);
    alert(`Successfully toggled availability flags for selected items!`);
  };

  const handleBulkApplyDiscounts = () => {
    if (selectedIds.length === 0) return;
    const factor = (100 - bulkDiscountPercent) / 100;
    
    const updated = items.map(x => {
      if (selectedIds.includes(x.id)) {
        const discountedPrice = Math.round(x.price * factor);
        return { 
          ...x, 
          price: Math.max(10, discountedPrice), 
          lastUpdated: new Date().toISOString().split('T')[0] 
        };
      }
      return x;
    });
    setItems(updated);
    setSelectedIds([]);
    setIsDiscountModalOpen(false);
    alert(`Discount parameters applied! Evaluated new Indian rates for chosen items.`);
  };

  const handleBulkDuplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const clones: MenuItem[] = [];
    const sourceItems = items.filter(x => selectedIds.includes(x.id));
    
    sourceItems.forEach((x, index) => {
      clones.push({
        ...x,
        id: 'cloned-' + Date.now() + '-' + index + '-' + Math.floor(Math.random() * 1000),
        name: `${x.name} (Copy)`,
        sortOrder: items.length + index + 1,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    });

    setItems([...items, ...clones]);
    setSelectedIds([]);
    alert(`Successfully duplicated ${selectedIds.length} items inside your spreadsheet!`);
  };

  // --- SAVE ALL COMPILATIONS TO LIVE SERVER ---
  const handlePersistAllChanges = async () => {
    if (items.length === 0) {
      alert("Spreadsheet holds zero menu items. Cannot commit empty menu sets.");
      return;
    }
    
    try {
      onUpdateMenu(items);
      setOriginalItems(JSON.parse(JSON.stringify(items)));
      setHasChanges(false);
      localStorage.removeItem('bhagwati_draft_recipes_v2'); // Clean draft upon absolute database save
      alert("✅ Hurray! All active menu names, price tags, category brackets, descriptions and image representations successfully written to permanent database!");
    } catch (e) {
      alert("System could not synchronize with target persistence server.");
    }
  };

  // --- ROLL BACK CHANGES ---
  const handleDiscardChanges = () => {
    if (confirm("Reset current excel grids? Any unsaved edits will be discarded.")) {
      setItems(JSON.parse(JSON.stringify(originalItems)));
      setHasChanges(false);
      setSelectedIds([]);
    }
  };

  // --- GRID NAVIGATION & SEARCH ---
  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedItems.length) {
      // Uncheck all items of current visible page
      const pageIds = paginatedItems.map(x => x.id);
      setSelectedIds(selectedIds.filter(id => !pageIds.includes(id)));
    } else {
      // Check all items of current visible page
      const pageIds = paginatedItems.map(x => x.id);
      const uniqueUnion = Array.from(new Set([...selectedIds, ...pageIds]));
      setSelectedIds(uniqueUnion);
    }
  };

  const handleToggleItemCheckbox = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSortChange = (field: keyof MenuItem | 'sortOrder') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort Pipeline
  const filteredItems = items.filter(item => {
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = item.name.toLowerCase().includes(term) || 
                          item.description.toLowerCase().includes(term) ||
                          item.id.toLowerCase().includes(term) ||
                          (item.category && item.category.toLowerCase().includes(term));
    
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesStatus = filterAvailability === 'All' || 
                          (filterAvailability === 'Available' && item.isAvailable) || 
                          (filterAvailability === 'Unavailable' && !item.isAvailable);
    const matchesFoodType = filterFoodType === 'All' || item.foodType === filterFoodType;
    const matchesFeatured = filterFeatured === 'All' || 
                           (filterFeatured === 'Featured' && item.isPopular) ||
                           (filterFeatured === 'Regular' && !item.isPopular);

    return matchesSearch && matchesCategory && matchesStatus && matchesFoodType && matchesFeatured;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let valueA = a[sortField];
    let valueB = b[sortField];

    if (valueA === undefined) valueA = '';
    if (valueB === undefined) valueB = '';

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }

    if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
      return sortDirection === 'asc' 
        ? (valueA === valueB ? 0 : valueA ? -1 : 1)
        : (valueA === valueB ? 0 : valueB ? -1 : 1);
    }

    return 0;
  });

  // Pagination Math
  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterAvailability, filterFoodType, filterFeatured, pageSize]);


  // Print trigger using native custom page layout
  const handlePrintMenu = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Categorize recipe list
    const categoryGroup: Record<string, MenuItem[]> = {};
    items.forEach(item => {
      if (!categoryGroup[item.category]) {
        categoryGroup[item.category] = [];
      }
      categoryGroup[item.category].push(item);
    });

    const printHtml = `
      <html>
        <head>
          <title>${config.brandName || "Bhagwati Cloud Kitchen"} - Authentic Feast Card</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Montserrat:wght@400;600;700&display=swap');
            body { 
              font-family: 'Montserrat', sans-serif; 
              color: #2D2522; 
              background: #FFFDFC; 
              padding: 40px; 
              margin: 0;
            }
            .menu-container { 
              max-width: 800px; 
              margin: 0 auto; 
              border: 3px double #800020; 
              padding: 40px; 
              background-image: radial-gradient(#F9EFEC 1px, transparent 0), radial-gradient(#F9EFEC 1px, transparent 0);
              background-size: 8px 8px;
              background-position: 0 0, 4px 4px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #800020; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .logo { 
              font-family: 'Cinzel', serif; 
              font-size: 32px; 
              font-weight: 900; 
              color: #800020; 
              text-transform: uppercase; 
              letter-spacing: 2px;
            }
            .subheader { 
              font-size: 11px; 
              text-transform: uppercase; 
              color: #B22222; 
              letter-spacing: 4px; 
              font-weight: 700; 
              margin-top: 5px; 
            }
            .contact-info { 
              font-size: 10px; 
              color: #6B7280; 
              margin-top: 10px; 
            }
            .category-section { 
              margin-bottom: 35px; 
              page-break-inside: avoid; 
            }
            .category-title { 
              font-family: 'Cinzel', serif; 
              font-size: 20px; 
              color: #800020; 
              font-weight: 700; 
              border-bottom: 1px dotted #800020; 
              padding-bottom: 5px; 
              margin-bottom: 15px; 
              text-transform: uppercase; 
              letter-spacing: 1px;
            }
            .menu-item { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              margin-bottom: 18px; 
            }
            .item-left { 
              max-width: 80%; 
            }
            .item-name { 
              font-weight: 700; 
              font-size: 14px; 
              color: #1A0F0D; 
              display: flex; 
              align-items: center; 
              gap: 6px; 
            }
            .tag-veg { font-size: 9px; padding: 2px 4px; border: 1px solid #10B981; color: #10B981; font-weight: 900; border-radius: 3px; }
            .tag-nonveg { font-size: 9px; padding: 2px 4px; border: 1px solid #EF4444; color: #EF4444; font-weight: 900; border-radius: 3px; }
            .tag-vegan { font-size: 9px; padding: 2px 4px; border: 1px solid #3B82F6; color: #3B82F6; font-weight: 900; border-radius: 3px; }
            .item-desc { 
              font-size: 11px; 
              color: #6E5F5C; 
              margin-top: 4px; 
              font-weight: 400; 
              line-height: 1.4; 
            }
            .item-price { 
              font-weight: 700; 
              color: #800020; 
              font-size: 15px; 
            }
            .footer { 
              text-align: center; 
              font-size: 9px; 
              color: #8C7570; 
              border-top: 1px solid #E5E7EB; 
              padding-top: 15px; 
              margin-top: 40px; 
              line-height: 1.5; 
            }
            @media print {
              body { padding: 0; background: #FFF; }
              .menu-container { border: none; padding: 0; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="menu-container">
            <div class="header">
              <div class="logo">${config.brandName || "Bhagwati Cloud Kitchen"}</div>
              <div class="subheader">Premium Culinary Menu</div>
              <div class="contact-info">
                📍 ${config.address || "Pune, Maharashtra"} | 📞 Call Us: ${config.mobileNumber || "9960877739"}
              </div>
            </div>
            
            ${categoriesList.map(cat => {
              const catItems = categoryGroup[cat] || [];
              if (catItems.length === 0) return '';
              return `
                <div class="category-section">
                  <div class="category-title">${cat}</div>
                  ${catItems.map(item => {
                    const normType = item.foodType || (item.isVeg ? 'Veg' : 'Non-Veg');
                    const badgeClass = normType === 'Veg' ? 'tag-veg' : normType === 'Vegan' ? 'tag-vegan' : 'tag-nonveg';
                    return `
                      <div class="menu-item">
                        <div class="item-left">
                          <div class="item-name">
                            ${item.isPopular ? '★ ' : ''}${item.name} 
                            <span class="${badgeClass}">${normType.toUpperCase()}</span>
                          </div>
                          <div class="item-desc">${item.description}</div>
                        </div>
                        <div class="item-price">₹${item.price}</div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `;
            }).join('')}

            <div class="footer">
              Thank you for choosing Bhagwati Culinary Services.<br/>
              *All ingredients sourced locally and prepared fresh under rigid hygiene protocols in Pune, Maharashtra.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
  };


  return (
    <div id="advanced-culinary-menu-manager" className="space-y-6">
      
      {/* Draft Recovery Notification Bar */}
      {draftExists && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shadow-xs animate-pulse">
          <div className="flex gap-2.5 items-center">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-neutral-900">Unsaved Session Draft Detected ⏳</p>
              <p className="text-[11px] text-neutral-500">We restored a cached offline draft of your thali, menu list, and prices safely.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={handleRestoreDraft}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-[10.5px] transition"
            >
              Restore Draft
            </button>
            <button 
              onClick={handleClearDraft}
              className="px-3.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-600 rounded-xl font-bold text-[10.5px] transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Auto-Save & Sync status panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-neutral-150 rounded-2xl p-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-full ${hasChanges ? 'bg-amber-100' : 'bg-green-100'}`}>
            <Sparkles className={`w-4 h-4 ${hasChanges ? 'text-amber-600 animate-spin' : 'text-green-600'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-neutral-800">Dynamic Excel Grid Editor</span>
              {hasChanges && (
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-500 text-white rounded-md font-bold uppercase tracking-wider animate-pulse">
                  Unsaved Local Edits
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              {lastAutoSaved ? `Draft secured in local storage at ${lastAutoSaved}` : 'Any cell modifications preserve draft values instantly'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
          {hasChanges && (
            <>
              <button
                onClick={handleDiscardChanges}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" /> Discard Edits
              </button>
              
              <button
                onClick={handlePersistAllChanges}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition animate-bounce cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save All Changes
              </button>
            </>
          )}

          <button
            onClick={handleAddNewItemClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 transition shadow-xs cursor-pointer ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" /> Add Culinary Item
          </button>
        </div>
      </div>

      {/* Main Excel Operations Controls */}
      <div className="bg-white border text-neutral-900 rounded-3xl p-5 space-y-4 shadow-2xs">
        
        {/* Row 1: Search, Filters & Quick Exports */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between border-b pb-4 border-neutral-100">
          
          {/* Left search */}
          <div className="relative w-full lg:max-w-xs shrink-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 h-4 text-neutral-400" />
            </span>
            <input
              type="text"
              placeholder="Search recipes, categories, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 font-medium placeholder-neutral-400 bg-neutral-50/50"
            />
          </div>

          {/* Core filters panel */}
          <div className="flex flex-wrap items-center gap-2 w-full justify-start lg:justify-end">
            <div className="flex items-center gap-1 bg-neutral-50 border p-1 rounded-xl text-[11px] font-bold">
              <span className="text-neutral-500 pl-1">Cat:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent focus:outline-none text-neutral-900 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-neutral-50 border p-1 rounded-xl text-[11px] font-bold">
              <span className="text-neutral-500 pl-1">Type:</span>
              <select
                value={filterFoodType}
                onChange={(e) => setFilterFoodType(e.target.value)}
                className="bg-transparent focus:outline-none text-neutral-900 cursor-pointer"
              >
                <option value="All">All Food Types</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-neutral-50 border p-1 rounded-xl text-[11px] font-bold">
              <span className="text-neutral-500 pl-1">Stock:</span>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="bg-transparent focus:outline-none text-neutral-900 cursor-pointer"
              >
                <option value="All">All Stock Status</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Out of Stock</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-neutral-50 border p-1 rounded-xl text-[11px] font-bold">
              <span className="text-neutral-500 pl-1">Promo:</span>
              <select
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value)}
                className="bg-transparent focus:outline-none text-neutral-900 cursor-pointer"
              >
                <option value="All">All Featured</option>
                <option value="Featured">★★ Featured</option>
                <option value="Regular">Regular Only</option>
              </select>
            </div>
          </div>

          {/* Right quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-[11px] font-bold rounded-xl transition cursor-pointer"
              title="Bulk Import XLSX or CSV"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>

            <div className="relative group/export">
              <button
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#800020]/10 text-[#800020] hover:bg-[#800020]/20 text-[11px] font-bold rounded-xl transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover/export:block z-40 w-36 bg-white border rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-100">
                <button 
                  onClick={() => handleExportData('xlsx')}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-neutral-50 text-neutral-700 flex items-center gap-1.5 border-b"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" /> Excel (.xlsx)
                </button>
                <button 
                  onClick={() => handleExportData('csv')}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-neutral-50 text-neutral-700 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" /> CSV Card (.csv)
                </button>
              </div>
            </div>

            <button
              onClick={handlePrintMenu}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white hover:bg-orange-700 text-[11px] font-bold rounded-xl transition cursor-pointer"
              title="Open Printable restaurant-style menu"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>

        </div>

        {/* Selected Batch Actions Drawer */}
        {selectedIds.length > 0 && (
          <div className="bg-orange-50 border border-orange-200/60 text-orange-950 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="text-xs font-extrabold">{selectedIds.length} recipes selected in your grid</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Shift */}
              <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-xl px-2 py-1 text-xs font-semibold">
                <span className="text-neutral-500">Cat:</span>
                <select
                  value={bulkCategoryTarget}
                  onChange={(e) => setBulkCategoryTarget(e.target.value as MenuItem['category'])}
                  className="bg-transparent focus:outline-none text-[10.5px] font-black"
                >
                  {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button 
                  onClick={handleBulkChangeCategory}
                  className="ml-1 text-[10.5px] px-1.5 py-0.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
                >
                  Apply
                </button>
              </div>

              {/* Set Availability */}
              <button
                onClick={() => handleBulkEditAvailability(true)}
                className="px-2.5 py-1.5 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-xl text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                Make Available
              </button>

              <button
                onClick={() => handleBulkEditAvailability(false)}
                className="px-2.5 py-1.5 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-xl text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                Make Unavailable
              </button>

              {/* Set Discounts */}
              <button
                onClick={() => setIsDiscountModalOpen(true)}
                className="px-2.5 py-1.5 bg-[#800020] text-white hover:bg-red-800 rounded-xl text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                Apply Discounts 🎯
              </button>

              {/* Duplicate */}
              <button
                onClick={handleBulkDuplicateSelected}
                className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                Duplicate Copies
              </button>

              {/* Delete permanently */}
              <button
                onClick={handleBulkDeleteSelected}
                className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition cursor-pointer"
                title="Delete Selected"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Interactive Spreadsheet Excel Grid */}
        <div 
          onPaste={handlePasteInSpreadsheet}
          className="hidden lg:block border border-neutral-150 rounded-2xl overflow-x-auto relative min-h-[400px] bg-neutral-50/50"
        >
          {items.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-neutral-300 animate-bounce" />
              <p className="text-sm font-bold text-neutral-700">Empty Chef Menu Registry</p>
              <p className="text-xs text-neutral-400 max-w-xs">Introduce custom recipes or paste values from Excel sheets to populate lists.</p>
              <button 
                onClick={handleSpreadsheetAddRow}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
              >
                Add My First Row 🍛
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-bold uppercase text-[9.5px] tracking-wider select-none sticky top-0 z-10">
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedItems.length > 0 && paginatedItems.every(x => selectedIds.includes(x.id))}
                      onChange={handleToggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="py-3 px-3 w-16 text-center cursor-pointer hover:bg-neutral-150" onClick={() => handleSortChange('sortOrder')}>
                    Index <ArrowUpDown className="w-3 h-3 inline-block ml-0.5" />
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:bg-neutral-150" onClick={() => handleSortChange('name')}>
                    Dish Recipe Name <ArrowUpDown className="w-3 h-3 inline-block ml-0.5" />
                  </th>
                  <th className="py-3 px-3 w-40 cursor-pointer hover:bg-neutral-150" onClick={() => handleSortChange('category')}>
                    Category Bracket <ArrowUpDown className="w-3 h-3 inline-block ml-0.5" />
                  </th>
                  <th className="py-3 px-3 w-32 cursor-pointer hover:bg-neutral-150" onClick={() => handleSortChange('price')}>
                    Price (INR ₹) <ArrowUpDown className="w-3 h-3 inline-block ml-0.5" />
                  </th>
                  <th className="py-3 px-3 w-40 cursor-pointer hover:bg-neutral-150" onClick={() => handleSortChange('foodType')}>
                    Food Spec <ArrowUpDown className="w-3 h-3 inline-block ml-0.5" />
                  </th>
                  <th className="py-3 px-3 w-32 text-center cursor-pointer hover:bg-neutral-150" onClick={() => handleSortChange('isAvailable')}>
                    Availability <ArrowUpDown className="w-3 h-3 inline-block ml-0.5" />
                  </th>
                  <th className="py-3 px-3 w-28 text-center cursor-pointer hover:bg-neutral-150" onClick={() => handleSortChange('isPopular')}>
                    Featured ★ <ArrowUpDown className="w-3 h-3 inline-block ml-0.5" />
                  </th>
                  <th className="py-3 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150 bg-white">
                {paginatedItems.map((item, index) => {
                  const sequentialIndex = startIndex + index + 1;
                  const itemFoodType = item.foodType || (item.isVeg ? 'Veg' : 'Non-Veg');
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-neutral-50/70 transition-colors ${selectedIds.includes(item.id) ? 'bg-orange-50/30' : ''}`}
                    >
                      {/* Batch Select Checkbox */}
                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleToggleItemCheckbox(item.id)}
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                      </td>

                      {/* Explicit Index */}
                      <td className="py-2.5 px-3 text-center text-neutral-500 font-mono text-[11px]">
                        {item.sortOrder || sequentialIndex}
                      </td>

                      {/* Live Edit Dish Name */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="relative group/inline-img w-8 h-8 rounded-lg overflow-hidden shrink-0 border cursor-pointer bg-neutral-100 shadow-sm" title="Click to upload new image from device">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop'}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).onerror = null;
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop';
                              }}
                            />
                            {/* Hover Camera/Device Upload Trigger Overlay */}
                            <label className="absolute inset-0 bg-neutral-900/70 hover:bg-neutral-950/80 opacity-0 group-hover/inline-img:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                              <Camera className="w-3.5 h-3.5 text-white animate-pulse" />
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    try {
                                      const file = e.target.files[0];
                                      const compressed = await compressImage(file);
                                      handleCellEdit(item.id, 'image', compressed);
                                    } catch (err) {
                                      console.error("Local upload failed", err);
                                    }
                                  }
                                }} 
                              />
                            </label>
                          </div>
                          <div className="w-full">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleCellEdit(item.id, 'name', e.target.value)}
                              className="w-full bg-transparent px-1 py-0.5 focus:bg-white border-b border-transparent focus:border-neutral-300 focus:outline-none font-bold text-neutral-800 focus:ring-1 focus:ring-orange-600 rounded"
                            />
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleCellEdit(item.id, 'description', e.target.value)}
                              className="w-full bg-transparent px-1 py-0 px-0.5 focus:bg-white text-[10px] text-neutral-400 focus:text-neutral-700 border-b border-transparent focus:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-orange-600 rounded mt-0.5"
                              placeholder="Add brief delicious detail description..."
                            />
                          </div>
                        </div>
                      </td>

                      {/* Dropdown Category select */}
                      <td className="py-2.5 px-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleCellEdit(item.id, 'category', e.target.value)}
                          className="px-1.5 py-1 text-xs bg-neutral-50 hover:bg-neutral-100/85 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 cursor-pointer text-semibold text-neutral-800"
                        >
                          {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>

                      {/* Edit Price */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 w-24">
                          <span className="text-neutral-400 font-semibold font-mono">₹</span>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleCellEdit(item.id, 'price', Number(e.target.value))}
                            className="bg-transparent text-xs w-full px-1.5 py-0.5 focus:bg-white font-black font-mono border-b border-transparent focus:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-orange-600 rounded"
                            min={10}
                          />
                        </div>
                      </td>

                      {/* Dropdown Food Type (Veg/Non-Veg/Vegan) */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            itemFoodType === 'Veg' ? 'bg-emerald-500' : itemFoodType === 'Vegan' ? 'bg-blue-500' : 'bg-red-500'
                          }`} />
                          <select
                            value={itemFoodType}
                            onChange={(e) => handleCellEdit(item.id, 'foodType', e.target.value)}
                            className="px-1.5 py-1 text-xs bg-neutral-50 hover:bg-neutral-100/85 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 cursor-pointer text-semibold text-neutral-800 font-bold"
                          >
                            <option value="Veg">Veg</option>
                            <option value="Non-Veg">Non-Veg</option>
                            <option value="Vegan">Vegan</option>
                          </select>
                        </div>
                      </td>

                      {/* Toggle Stock Availability */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleCellEdit(item.id, 'isAvailable', !item.isAvailable)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition cursor-pointer ${
                            item.isAvailable 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-neutral-150 text-neutral-600'
                          }`}
                        >
                          {item.isAvailable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{item.isAvailable ? 'In Stock' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Toggle Featured Promos */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleCellEdit(item.id, 'isPopular', !item.isPopular)}
                          className={`p-1.5 rounded-xl transition cursor-pointer ${
                            item.isPopular 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'bg-neutral-50 text-neutral-400 hover:text-neutral-600'
                          }`}
                          title="Feature this recipe on landing menu cards"
                        >
                          <Flame className={`w-4 h-4 ${item.isPopular ? 'fill-orange-600 text-orange-600' : ''}`} />
                        </button>
                      </td>

                      {/* Row Operations */}
                      <td className="py-2.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleEditItemLocally(item)}
                          className="p-1 px-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg transition"
                          title="Advanced Parameter edits"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItemLocally(item.id)}
                          className="p-1 px-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Responsive Mobile & Tablet Card List (Mobile-First Easy-Entry Layout) */}
        {items.length > 0 && (
          <div className="block lg:hidden space-y-4">
            {paginatedItems.map((item, index) => {
              const sequentialIndex = startIndex + index + 1;
              const itemFoodType = item.foodType || (item.isVeg ? 'Veg' : 'Non-Veg');
              
              return (
                <div 
                  key={`mobile-row-${item.id}`} 
                  className={`border rounded-2xl p-4 space-y-3.5 transition-all shadow-xs relative ${
                    selectedIds.includes(item.id) 
                      ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-300/20' 
                      : 'bg-white border-neutral-150 hover:border-neutral-250'
                  }`}
                >
                  {/* Card Header row with selection, index, and operations */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleItemCheckbox(item.id)}
                        className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-150 text-neutral-700 font-mono text-[10.5px] font-bold">
                        {item.sortOrder || sequentialIndex}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditItemLocally(item)}
                        className="p-1 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1"
                        title="Advanced parameters"
                      >
                        <Edit className="w-3 h-3" /> Adjust
                      </button>
                      <button
                        onClick={() => handleDeleteItemLocally(item.id)}
                        className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                        title="Delete recipe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Main contents: Image block and inputs */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    
                    {/* File Upload Zone */}
                    <div className="relative group/inline-img w-20 h-20 rounded-xl overflow-hidden shrink-0 border cursor-pointer bg-neutral-100 shadow-xs self-center sm:self-start mx-auto sm:mx-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop';
                        }}
                      />
                      <label className="absolute inset-x-0 bottom-0 bg-neutral-900/75 py-1.5 flex items-center justify-center gap-1 cursor-pointer">
                        <Camera className="w-3 h-3 text-white animate-pulse" />
                        <span className="text-[8px] font-extrabold text-white tracking-wider leading-none">TAP CHOOSE</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              try {
                                const file = e.target.files[0];
                                const compressed = await compressImage(file);
                                handleCellEdit(item.id, 'image', compressed);
                              } catch (err) {
                                console.error("Local upload failed", err);
                              }
                            }
                          }} 
                        />
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 w-full space-y-2">
                      <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block mb-0.5">Recipe Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleCellEdit(item.id, 'name', e.target.value)}
                          placeholder="e.g. Kashmiri Chana Masala"
                          className="w-full bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white px-2.5 py-1.5 border rounded-xl focus:ring-2 focus:ring-[#800020]/25 focus:border-[#800020] focus:outline-none font-bold text-neutral-800 text-xs transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block mb-0.5">Description details</label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleCellEdit(item.id, 'description', e.target.value)}
                          placeholder="Add ingredients details, cooking times, spices profile..."
                          className="w-full bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white px-2.5 py-1.5 border rounded-xl focus:ring-2 focus:ring-[#800020]/25 focus:border-[#800020] focus:outline-none text-neutral-700 text-xs transition-colors resize-none placeholder-neutral-300"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Categories, Pricing, and Food Spec Subgrid */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1.5">
                    <div>
                      <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block mb-0.5">Category</label>
                      <select
                        value={item.category}
                        onChange={(e) => handleCellEdit(item.id, 'category', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/25 focus:border-[#800020] cursor-pointer font-bold text-neutral-800"
                      >
                        {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block mb-0.5">Price (₹)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-neutral-400 font-bold font-mono text-xs">₹</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleCellEdit(item.id, 'price', Number(e.target.value))}
                          min={0}
                          className="w-full pl-5 pr-2 py-1.5 text-xs bg-neutral-50 focus:bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/25 focus:border-[#800020] font-black font-mono text-neutral-800 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block mb-0.5">Food Spec</label>
                      <select
                        value={itemFoodType}
                        onChange={(e) => handleCellEdit(item.id, 'foodType', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/25 focus:border-[#800020] cursor-pointer font-extrabold text-neutral-800"
                      >
                        <option value="Veg">💚 Veg</option>
                        <option value="Non-Veg">❤️ Non-Veg</option>
                        <option value="Vegan">🌱 Vegan</option>
                      </select>
                    </div>
                  </div>

                  {/* Status buttons row */}
                  <div className="flex bg-neutral-50 border border-neutral-100 rounded-xl p-2 items-center justify-between mt-1">
                    <span className="text-[9.5px] font-black text-neutral-400 uppercase tracking-widest pl-1">Display & Promotion</span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCellEdit(item.id, 'isAvailable', !item.isAvailable)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer select-none border ${
                          item.isAvailable 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }`}
                      >
                        {item.isAvailable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>{item.isAvailable ? 'In Stock' : 'Inactive'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCellEdit(item.id, 'isPopular', !item.isPopular)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer select-none border ${
                          item.isPopular 
                            ? 'bg-orange-50 text-orange-700 border-orange-200' 
                            : 'bg-neutral-100 text-neutral-400 hover:text-neutral-500 border-neutral-200'
                        }`}
                      >
                        <Flame className={`w-3 h-3 ${item.isPopular ? 'fill-orange-600 text-orange-600' : ''}`} />
                        <span>Featured</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Excel Pagination Controls */}
        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border rounded-lg bg-neutral-50 text-neutral-800 font-bold focus:outline-none"
              >
                <option value={10}>10 records</option>
                <option value={25}>25 records</option>
                <option value={50}>50 records</option>
                <option value={100}>100 records</option>
              </select>
              <span>of {totalItems} filtered recipes (Total {items.length})</span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1.5 border rounded-lg bg-white hover:bg-neutral-50 text-neutral-600 disabled:opacity-45 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-xs font-serif font-extrabold rounded-lg border transition ${
                      currentPage === i + 1 
                        ? 'bg-[#800020] text-white border-[#800020]' 
                        : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-1.5 border rounded-lg bg-white hover:bg-neutral-50 text-neutral-600 disabled:opacity-45 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>


      {/* MODAL / DRAWER A: ADDS OR EDITS INDIVIDUAL RECIPES */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex justify-center items-center p-4 overflow-y-auto backdrop-blur-xs select-none">
          <div className="bg-white border rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 animate-in duration-200 zoom-in-95 my-8">
            
            <div className="flex justify-between items-center border-b pb-3.5">
              <h3 className="font-serif font-black text-[#800020] text-lg">
                {editingItem ? `Modify Recipe: ${editingItem.name}` : `Introduce New culinary Offering`}
              </h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingItem(null);
                }}
                className="p-1.5 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="text-xs font-black text-neutral-600 block mb-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kashmiri Chole Kulche"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 font-semibold uppercase bg-neutral-50/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-600 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 font-black inline"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-600 block mb-1">Category Bracket</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MenuItem['category'])}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 text-semibold"
                  >
                    {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-600 block mb-1">Food Specifications type</label>
                  <select
                    value={formFoodType}
                    onChange={(e) => setFormFoodType(e.target.value as MenuItem['foodType'])}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 text-bold font-black"
                  >
                    <option value="Veg">Veg 🌱</option>
                    <option value="Non-Veg">Non-Veg 🍗</option>
                    <option value="Vegan">Vegan 🍃</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-black text-neutral-600 block mb-1">Dish Description</label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Provide aromatic details describing ingredients, spice combinations, and layout pairings..."
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white font-medium"
                  />
                </div>

              </div>

              {/* Gemini AI Copilot Integration Inside Modals */}
              <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200">
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#800020] flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" /> Generative AI Copywriter
                </p>
                <p className="text-[10.5px] text-neutral-500 mb-2 leading-tight">Gemini can analyze the name & category to draft flavor descriptions automatically.</p>
                
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                  <button
                    type="button"
                    onClick={handleAIGenerator}
                    disabled={isAIGenerating}
                    className="py-2 px-4 bg-[#800020] font-black text-[10.5px] text-white rounded-xl hover:bg-red-800 disabled:opacity-40 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isAIGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Drafting culinary descriptions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Auto-Generate with Gemini
                      </>
                    )}
                  </button>
                  {aiMessage && (
                    <span className="text-[10px] text-orange-850 font-black sm:ml-2 italic">{aiMessage}</span>
                  )}
                </div>
              </div>

              {/* Image Drag & Drop Smart Upload component */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-neutral-700 block">Culinary Representative Image</span>
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDropSingle}
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 transition duration-200 ${
                    isDragging || dragOverRef.current 
                      ? 'border-orange-500 bg-orange-50/40' 
                      : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/30'
                  }`}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border relative bg-white">
                    {formImg.trim() ? (
                      <img 
                        src={formImg.trim()} 
                        alt="Recipe Thumbnail preview" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                        <X className="w-5 h-5 text-neutral-400" />
                      </div>
                    )}
                  </div>

                  <div className="text-center sm:text-left space-y-1 w-full">
                    <p className="text-xs font-black text-neutral-800">Drag & Drop Image or Tap Upload</p>
                    <p className="text-[10px] text-neutral-400">Automatic local image compressor compiles formats (JPG, PNG, WEBP) under lightweight thresholds.</p>
                    
                    <div className="flex gap-2 pt-1 font-mono">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFormFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-[10px] font-bold hover:bg-neutral-800 transition"
                      >
                        Select Image file
                      </button>
                      <input
                        type="text"
                        placeholder="Or handwrite Image url..."
                        value={formImg}
                        onChange={(e) => setFormImg(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-[10px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status toggles */}
              <div className="flex flex-wrap gap-4 pt-2.5 items-center justify-start border-t border-neutral-100">
                <label className="flex items-center gap-1.5 text-xs text-neutral-700 font-bold col-span-1">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Recipe immediately active on restaurant shelves</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-neutral-700 font-bold col-span-1">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Make Featured Item on landing catalogs ⭐</span>
                </label>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-black text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel Actions
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#800020] text-white hover:bg-red-800 font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingItem ? 'Publish Modified Recipe' : 'Add New Recipe'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* MODAL / DRAWER B: BULK UPLOAD SYSTEM */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex justify-center items-center p-4 overflow-y-auto backdrop-blur-xs select-none">
          <div className="bg-white border rounded-3xl p-6 w-full max-w-3xl shadow-2xl space-y-4 animate-in duration-200 zoom-in-95 my-8">
            
            <div className="flex justify-between items-center border-b pb-3 border-neutral-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-orange-600" />
                <h3 className="font-serif font-black text-neutral-900 text-lg">Excel / CSV Bulk Recipe Importer</h3>
              </div>
              <button
                onClick={() => {
                  setIsBulkImportOpen(false);
                  setImportReport(null);
                }}
                className="p-1 px-1.5 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Prompt */}
            <div className="bg-neutral-50/50 border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-neutral-800">Need standard headers configuration?</p>
                <p className="text-[10px] text-neutral-500">Download our validated sample CSV layout. Populate your catering thali items, price tags, and food types effortlessly.</p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-[11px] transition shrink-0 inline-flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Template
              </button>
            </div>

            {/* File Drag Zone / Upload Buttons */}
            {!importReport ? (
              <div className="border-2 border-dashed border-neutral-200 hover:border-orange-500 bg-neutral-50/20 p-8 rounded-2xl text-center space-y-4 transition duration-200 max-w-lg mx-auto">
                <Upload className="w-10 h-10 text-neutral-300 mx-auto animate-bounce" />
                <div>
                  <p className="text-xs font-bold text-neutral-800">Support formats: Excel (.xlsx), CSV (.csv)</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Pick local file catalogs. Smart system aligns lists, sanitizes values and validates rates instantly.</p>
                </div>
                <div>
                  <input
                    type="file"
                    id="bulk-import-file-elem"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleImportFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('bulk-import-file-elem')?.click()}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Select File from Folder
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Reports Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-t py-3 select-none">
                  <div className="bg-neutral-50 p-3 rounded-lg text-center border">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Total Rows Detected</span>
                    <span className="text-xl font-black font-mono text-neutral-800">{importReport.summary.total}</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg text-center border border-emerald-100">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-bold block">Verified Valid Items</span>
                    <span className="text-xl font-black font-mono text-emerald-800">{importReport.summary.validCount}</span>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center border border-red-150">
                    <span className="text-[9px] uppercase tracking-wider text-red-500 font-bold block">Rejected Invalid Rows</span>
                    <span className="text-xl font-black font-mono text-red-800">{importReport.summary.invalidCount}</span>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg text-center border border-amber-100">
                    <span className="text-[9px] uppercase tracking-wider text-amber-500 font-bold block">Duplicates Checked</span>
                    <span className="text-xl font-black font-mono text-amber-800">{importReport.summary.duplicatesDetected}</span>
                  </div>
                </div>

                {/* Duplicates Overwrite vs Skip selector */}
                {importReport.summary.duplicatesDetected > 0 && (
                  <div className="bg-amber-50 border border-amber-200/50 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-xs font-bold text-amber-850 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Duplicates Mitigation Strategy
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">How would you like to handle items whose names match existing active menu recipes?</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setImportOptionDuplicate('update')}
                        className={`px-3 py-1.5 text-[10.5px] font-bold rounded-xl transition border cursor-pointer ${
                          importOptionDuplicate === 'update' 
                            ? 'bg-amber-500 text-white border-amber-500' 
                            : 'bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-300'
                        }`}
                      >
                        Override Matching Data
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportOptionDuplicate('duplicate')}
                        className={`px-3 py-1.5 text-[10.5px] font-bold rounded-xl transition border cursor-pointer  ${
                          importOptionDuplicate === 'duplicate' 
                            ? 'bg-neutral-900 text-white border-neutral-900' 
                            : 'bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-300'
                        }`}
                      >
                        Insert copy Clones
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportOptionDuplicate('skip')}
                        className={`px-3 py-1.5 text-[10.5px] font-bold rounded-xl transition border cursor-pointer  ${
                          importOptionDuplicate === 'skip' 
                            ? 'bg-orange-600 text-white border-orange-600' 
                            : 'bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-300'
                        }`}
                      >
                        Skip Imports
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Report List */}
                {importReport.invalid.length > 0 && (
                  <div className="bg-red-50/50 border border-red-150 rounded-2xl p-4 space-y-2.5 max-h-[150px] overflow-y-auto">
                    <p className="text-xs font-black text-red-800">Errors Diagnostics Report</p>
                    <div className="divide-y divide-red-200">
                      {importReport.invalid.map((inv, idx) => (
                        <div key={idx} className="py-1.5 text-[10.5px] flex justify-between items-start gap-1">
                          <span className="font-bold text-neutral-700">{inv.item} (Row {inv.row})</span>
                          <span className="text-red-600 text-right font-mono font-bold leading-normal">{inv.errors.join(' | ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Import Preview list */}
                <div className="space-y-1.5">
                  <p className="text-xs font-black text-neutral-700">Preview Valid Items parsed ({importReport.valid.length} items)</p>
                  <div className="border border-neutral-150 rounded-xl overflow-x-auto max-h-[220px] overflow-y-auto">
                    <table className="w-full text-left text-[10.5px] border-collapse bg-white">
                      <thead className="bg-neutral-50 font-bold sticky top-0 border-b border-neutral-150">
                        <tr>
                          <th className="py-2 px-3 text-neutral-600 uppercase text-[9px]">Item Name</th>
                          <th className="py-2 px-3 text-neutral-600 uppercase text-[9px] w-28">Category</th>
                          <th className="py-2 px-3 text-neutral-600 uppercase text-[9px] w-20">Price</th>
                          <th className="py-2 px-3 text-neutral-600 uppercase text-[9px] w-24">Type</th>
                          <th className="py-2 px-3 text-neutral-600 uppercase text-[9px] w-28">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {importReport.valid.map((v, i) => (
                          <tr key={i} className="hover:bg-neutral-50/50">
                            <td className="py-2 px-3 font-bold text-neutral-800">{v.name}</td>
                            <td className="py-2 px-3 font-semibold text-neutral-600">{v.category}</td>
                            <td className="py-2 px-3 font-black text-neutral-800 font-mono">₹{v.price}</td>
                            <td className="py-2 px-3 font-bold text-neutral-700">{v.foodType}</td>
                            <td className="py-2 px-3">
                              {v.isDuplicate ? (
                                <span className="text-[9px] font-black text-amber-600 uppercase">{importOptionDuplicate.toUpperCase()} MATCH</span>
                              ) : (
                                <span className="text-[9px] font-black text-emerald-600 uppercase">NEW INSERTION</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Confirm Import block */}
                <div className="flex justify-end gap-2.5 pt-4 border-t select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setImportReport(null);
                      setRawImportData([]);
                    }}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-black text-xs rounded-xl transition cursor-pointer"
                  >
                    Clear Spreadsheet Data
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitBulkImport}
                    disabled={importReport.valid.length === 0}
                    className="px-5 py-2 bg-[#800020] text-white hover:bg-red-800 disabled:opacity-45 font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Validate & Commit to Grid
                  </button>
                </div>

              </div>
            )}

            {/* Smart image matching matcher component upload section */}
            <div className="border-t border-dashed pt-4">
              <p className="text-xs font-black text-neutral-800 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" /> Bulk Image ZIP folder Asset matcher
              </p>
              <p className="text-[10px] text-neutral-500 leading-normal mb-3">
                Have folder pictures matching dish item titles? Click below to upload bulk JPG, PNG or WEBP culinary representation icons simultaneously. System matches filenames to grid names.
              </p>
              <input
                type="file"
                ref={bulkImgInputRef}
                multiple
                accept="image/*"
                onChange={handleBulkImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => bulkImgInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-250 text-neutral-700 text-[10.5px] font-bold rounded-xl transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-neutral-500" /> Match Selected Picture Series
              </button>
              {imagesCompressionConsole && (
                <p className="text-[10px] text-orange-850 font-semibold mt-2 animate-pulse">{imagesCompressionConsole}</p>
              )}
            </div>

          </div>
        </div>
      )}


      {/* MODAL / DRAWER C: APPLY DISCOUNTS MODAL */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex justify-center items-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white border rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in duration-200 zoom-in-95">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-serif font-black text-[#800020] text-base">Bulk Apply Discounts 🎯</h3>
              <button onClick={() => setIsDiscountModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-[11px] text-neutral-500 leading-normal">
                This will reduce the pricing parameters of all {selectedIds.length} currently checked menu items on your active spreadsheet by the selected percentage offset.
              </p>
              <div>
                <label className="text-xs font-black text-neutral-600 block mb-1">Discount margin (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={5}
                    max={75}
                    step={5}
                    value={bulkDiscountPercent}
                    onChange={(e) => setBulkDiscountPercent(Number(e.target.value))}
                    className="flex-1 accent-orange-600 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-black text-neutral-800 w-12 text-right">{bulkDiscountPercent}% OFF</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs font-black pt-3 border-t">
              <button 
                onClick={() => setIsDiscountModalOpen(false)}
                className="px-3.5 py-2 bg-neutral-100 rounded-xl text-neutral-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkApplyDiscounts}
                className="px-4 py-2 bg-[#800020] hover:bg-red-800 text-white rounded-xl shadow-xs"
              >
                Apply Parameters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
