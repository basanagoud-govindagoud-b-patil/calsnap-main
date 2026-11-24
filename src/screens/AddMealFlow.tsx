import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Camera,
  Upload,
  Search,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Utensils,
  Edit3,
  RotateCcw,
  ArrowLeft,
  Info,
} from 'lucide-react';
import {
  AnalyzeMealResponse,
  FoodCatalogItem,
  FoodPrediction,
  MealEntry,
  MealItem,
  MealType,
  calculateItemCalories,
  calculateItemsTotalCalories,
} from '../types';
import {
  SAMPLE_PHOTO_OPTIONS,
  buildFallbackAnalysis,
  formatDateKey,
  inferMealTypeByClock,
  searchFoodCatalog,
} from '../data/foodCatalog';
import {
  compressDataUrl,
  processUploadedFile,
  urlToBase64Image,
  validateImageFile,
} from '../utils/imageUtils';
import { getCurrentTime24 } from '../utils/storage';
import { FoodImage } from '../components/FoodImage';

interface AddMealFlowProps {
  userId: string;
  initialDate?: string;
  initialMealType?: MealType;
  initialManual?: boolean;
  editingMeal?: MealEntry | null;
  onClose: () => void;
  onSaveMeal: (meal: MealEntry, isEdit: boolean) => void;
}

type FlowStep = 'capture' | 'analyzing' | 'review' | 'error' | 'no-food';

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function createItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const AddMealFlow: React.FC<AddMealFlowProps> = ({
  userId,
  initialDate,
  initialMealType,
  initialManual = false,
  editingMeal = null,
  onClose,
  onSaveMeal,
}) => {
  const [step, setStep] = useState<FlowStep>(() =>
    editingMeal || initialManual ? 'review' : 'capture'
  );

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(
    editingMeal?.photoUrl
  );
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string>('image/jpeg');
  const [photoSourceUrl, setPhotoSourceUrl] = useState<string | undefined>(undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Live camera modal state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Analysis / review state
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [usedFallbackNotice, setUsedFallbackNotice] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState<boolean>(
    Boolean(initialManual || editingMeal?.isManual)
  );
  const [mealDate, setMealDate] = useState<string>(
    editingMeal?.date || initialDate || formatDateKey(new Date())
  );
  const [mealTime, setMealTime] = useState<string>(
    editingMeal?.time || getCurrentTime24()
  );
  const [mealType, setMealType] = useState<MealType>(
    editingMeal?.mealType || initialMealType || inferMealTypeByClock()
  );

  const [items, setItems] = useState<MealItem[]>(() => {
    if (editingMeal && editingMeal.items.length > 0) {
      return editingMeal.items.map((item) => ({ ...item }));
    }
    if (initialManual) {
      return [
        {
          id: createItemId(),
          name: 'Grilled Chicken Caesar Salad',
          grams: 280,
          defaultGrams: 280,
          kcalPer100g: 158,
        },
      ];
    }
    return [];
  });

  // Search per-item dropdown
  const [searchOpenForId, setSearchOpenForId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Calorie override
  const [overrideEnabled, setOverrideEnabled] = useState<boolean>(
    editingMeal?.overrideCalories != null
  );
  const [overrideValue, setOverrideValue] = useState<string>(
    editingMeal?.overrideCalories != null ? String(editingMeal.overrideCalories) : ''
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraFileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    setCameraError(null);
  };

  const openCamera = async () => {
    setUploadError(null);
    setCameraError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        streamRef.current = stream;
        setCameraOpen(true);
        requestAnimationFrame(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        });
        return;
      } catch {
        // Fall back smoothly to native camera input if camera permission denied or unavailable
        cameraFileInputRef.current?.click();
      }
    } else {
      cameraFileInputRef.current?.click();
    }
  };

  const captureFromLiveCamera = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    stopCamera();
    try {
      const compressed = await compressDataUrl(rawDataUrl, 960, 0.82);
      setPhotoPreview(compressed);
      setPhotoBase64(compressed.split(',')[1] || '');
      setPhotoMime('image/jpeg');
      setPhotoSourceUrl(undefined);
    } catch {
      setPhotoPreview(rawDataUrl);
      setPhotoBase64(rawDataUrl.split(',')[1] || '');
      setPhotoMime('image/jpeg');
      setPhotoSourceUrl(undefined);
    }
  };

  const handleSelectedFile = async (file: File) => {
    setUploadError(null);
    const validationErr = validateImageFile(file);
    if (validationErr) {
      setUploadError(validationErr);
      return;
    }
    try {
      const processed = await processUploadedFile(file);
      setPhotoPreview(processed.previewDataUrl);
      setPhotoBase64(processed.base64);
      setPhotoMime(processed.mimeType);
      setPhotoSourceUrl(undefined);
    } catch {
      setUploadError('Could not read that photo. Please try another JPEG, PNG, or HEIC image.');
    }
  };

  const handleSelectSamplePhoto = async (sampleUrl: string, suggestedType: MealType) => {
    setUploadError(null);
    setPhotoPreview(sampleUrl);
    setPhotoSourceUrl(sampleUrl);
    setMealType(suggestedType);
    try {
      const { base64, mimeType } = await urlToBase64Image(sampleUrl);
      setPhotoBase64(base64);
      setPhotoMime(mimeType);
    } catch {
      setPhotoBase64(null);
    }
  };

  const applyAnalysisToItems = (data: AnalyzeMealResponse) => {
    if (!data.foodDetected || !Array.isArray(data.items) || data.items.length === 0) {
      setStep('no-food');
      return;
    }

    if (
      data.suggestedMealType &&
      MEAL_TYPES.includes(data.suggestedMealType as MealType) &&
      !initialMealType
    ) {
      setMealType(data.suggestedMealType as MealType);
    }

    const mappedItems: MealItem[] = data.items
      .filter((entry) => Array.isArray(entry.predictions) && entry.predictions.length > 0)
      .map((entry) => {
        const sorted = [...entry.predictions]
          .slice(0, 3)
          .sort((a, b) => b.confidence - a.confidence);
        const top = sorted[0];
        const defaultGrams = Math.max(15, Math.min(1200, Math.round(top.defaultGrams || 150)));
        const kcalPer100g = Math.max(5, Math.min(900, Math.round(top.kcalPer100g || 140)));

        return {
          id: createItemId(),
          name: top.label,
          grams: defaultGrams,
          defaultGrams,
          kcalPer100g,
          confidence: Math.max(0, Math.min(1, top.confidence)),
          predictions: sorted.map((p) => ({
            label: p.label,
            confidence: Math.max(0, Math.min(1, p.confidence)),
            defaultGrams: Math.max(15, Math.min(1200, Math.round(p.defaultGrams || 150))),
            kcalPer100g: Math.max(5, Math.min(900, Math.round(p.kcalPer100g || 140))),
          })),
        };
      });

    if (mappedItems.length === 0) {
      setStep('no-food');
      return;
    }

    setItems(mappedItems);
    setOverrideEnabled(false);
    setOverrideValue('');
    setIsManualEntry(false);
    setStep('review');
  };

  const runAnalysis = async () => {
    if (!photoPreview) return;
    setAnalysisError(null);
    setUsedFallbackNotice(false);
    setStep('analyzing');

    try {
      let base64 = photoBase64;
      let mimeType = photoMime;

      if (!base64 && photoSourceUrl) {
        const fetched = await urlToBase64Image(photoSourceUrl);
        base64 = fetched.base64;
        mimeType = fetched.mimeType;
        setPhotoBase64(base64);
        setPhotoMime(mimeType);
      }

      if (!base64) {
        throw new Error('Could not prepare photo data for analysis.');
      }

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        // If API key is unavailable or service unreachable, offer graceful fallback
        if (response.status === 503 || payload?.code === 'API_UNAVAILABLE') {
          setUsedFallbackNotice(true);
          applyAnalysisToItems(buildFallbackAnalysis(photoSourceUrl));
          return;
        }
        throw new Error(payload?.error || 'Could not analyze the meal photo.');
      }

      applyAnalysisToItems(payload as AnalyzeMealResponse);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setAnalysisError(msg);
      setStep('error');
    }
  };

  const handleUseFallbackEstimate = () => {
    setUsedFallbackNotice(true);
    setAnalysisError(null);
    applyAnalysisToItems(buildFallbackAnalysis(photoSourceUrl));
  };

  const switchToManualMode = () => {
    setIsManualEntry(true);
    setUsedFallbackNotice(false);
    if (items.length === 0) {
      setItems([
        {
          id: createItemId(),
          name: 'Oatmeal with Fresh Berries & Chia',
          grams: 280,
          defaultGrams: 280,
          kcalPer100g: 92,
        },
      ]);
    }
    setStep('review');
  };

  const selectPredictionForItem = (itemId: string, pred: FoodPrediction) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name: pred.label,
              grams: pred.defaultGrams,
              defaultGrams: pred.defaultGrams,
              kcalPer100g: pred.kcalPer100g,
              confidence: pred.confidence,
            }
          : item
      )
    );
  };

  const selectCatalogFoodForItem = (itemId: string, food: FoodCatalogItem) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name: food.name,
              grams: food.defaultGrams,
              defaultGrams: food.defaultGrams,
              kcalPer100g: food.kcalPer100g,
              confidence: 1,
            }
          : item
      )
    );
    setSearchOpenForId(null);
    setSearchQuery('');
  };

  const updateItemGrams = (itemId: string, grams: number) => {
    const safe = Math.max(0, Math.min(2500, Math.round(grams)));
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, grams: safe } : item))
    );
  };

  const updateItemField = (
    itemId: string,
    patch: Partial<Pick<MealItem, 'name' | 'kcalPer100g'>>
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    );
  };

  const addAnotherItem = () => {
    const newItem: MealItem = {
      id: createItemId(),
      name: 'Mixed Greens Side Salad',
      grams: 110,
      defaultGrams: 110,
      kcalPer100g: 42,
    };
    setItems((prev) => [...prev, newItem]);
    setSearchOpenForId(newItem.id);
    setSearchQuery('');
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const calculatedCalories = calculateItemsTotalCalories(items);
  const parsedOverride = Number(overrideValue);
  const hasValidOverride =
    overrideEnabled && overrideValue.trim() !== '' && !Number.isNaN(parsedOverride) && parsedOverride >= 0;
  const finalCalories = hasValidOverride ? Math.round(parsedOverride) : calculatedCalories;

  const hasLowConfidence = items.some(
    (item) => typeof item.confidence === 'number' && item.confidence < 0.5
  );

  const handleSave = () => {
    const cleanedItems = items
      .filter((it) => it.name.trim().length > 0)
      .map((it) => ({
        ...it,
        name: it.name.trim(),
        grams: Math.max(0, Math.round(it.grams)),
      }));

    if (cleanedItems.length === 0) return;

    const meal: MealEntry = {
      id: editingMeal?.id || `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      date: mealDate,
      time: mealTime,
      mealType,
      photoUrl: photoPreview,
      items: cleanedItems,
      overrideCalories: hasValidOverride ? Math.round(parsedOverride) : null,
      totalCalories: finalCalories,
      isManual: isManualEntry && !photoPreview,
      createdAt: editingMeal?.createdAt || Date.now(),
    };

    onSaveMeal(meal, Boolean(editingMeal));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-meal-title"
    >
      <div className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-[24px] border border-slate-200/80 dark:border-slate-800 shadow-2xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {step === 'review' && !editingMeal && !initialManual && (
              <button
                type="button"
                onClick={() => setStep('capture')}
                aria-label="Back to photo selection"
                className="min-h-[44px] min-w-[44px] -ml-2 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
            )}
            <h2
              id="add-meal-title"
              className="font-display text-lg font-bold text-slate-900 dark:text-slate-50"
            >
              {editingMeal
                ? 'Edit meal'
                : step === 'capture'
                ? 'Add a meal'
                : step === 'analyzing'
                ? 'Analyzing photo'
                : step === 'review'
                ? isManualEntry && !photoPreview
                  ? 'Add meal manually'
                  : 'Review meal estimate'
                : step === 'no-food'
                ? 'No food detected'
                : 'Analysis issue'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="Close add meal modal"
            className="min-h-[44px] min-w-[44px] -mr-2 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSelectedFile(file);
              e.target.value = '';
            }}
          />
          <input
            ref={cameraFileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSelectedFile(file);
              e.target.value = '';
            }}
          />

          {/* STEP 1: CAPTURE */}
          {step === 'capture' && (
            <div className="space-y-5">
              {cameraOpen ? (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3]">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="pointer-events-none absolute inset-6 border-2 border-white/60 rounded-2xl"
                      aria-hidden="true"
                    />
                  </div>
                  {cameraError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{cameraError}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="min-h-[48px] px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={captureFromLiveCamera}
                      className="flex-1 min-h-[48px] px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
                    >
                      <Camera size={18} aria-hidden="true" />
                      Capture photo
                    </button>
                  </div>
                </div>
              ) : photoPreview ? (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[4/3] max-h-80 w-full">
                    <FoodImage
                      src={photoPreview}
                      alt="Selected meal preview"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(undefined);
                        setPhotoBase64(null);
                        setPhotoSourceUrl(undefined);
                      }}
                      className="min-h-[48px] px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
                    >
                      Choose another photo
                    </button>
                    <button
                      type="button"
                      onClick={runAnalysis}
                      className="flex-1 min-h-[48px] px-6 rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      Identify food &amp; calories
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Drag-and-drop / Action Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleSelectedFile(file);
                    }}
                    className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-green-600 bg-green-50/70 dark:bg-green-950/30'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/50'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 flex items-center justify-center">
                      <Camera size={24} aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                      Snap a meal or drop a photo here
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Accepts JPEG, PNG, and HEIC up to 10 MB
                    </p>

                    <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={openCamera}
                        className="min-h-[48px] px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Camera size={18} aria-hidden="true" />
                        Take photo
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="min-h-[48px] px-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Upload size={18} aria-hidden="true" />
                        Upload from gallery
                      </button>
                    </div>
                  </div>

                  {uploadError && (
                    <div
                      role="alert"
                      className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-sm text-red-700 dark:text-red-300 flex items-start gap-2.5"
                    >
                      <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Quick Sample Meal Photos for Desktop Testing */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Or try a sample meal photo
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {SAMPLE_PHOTO_OPTIONS.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => handleSelectSamplePhoto(sample.imageUrl, sample.mealType)}
                          className="group text-left rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-green-500 dark:hover:border-green-500 bg-white dark:bg-slate-950 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
                        >
                          <FoodImage
                            src={sample.imageUrl}
                            alt={sample.title}
                            className="w-full h-20"
                          />
                          <div className="p-2">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {sample.title}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      No photo handy?
                    </span>
                    <button
                      type="button"
                      onClick={switchToManualMode}
                      className="min-h-[44px] px-3 rounded-xl text-sm font-semibold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Utensils size={15} aria-hidden="true" />
                      Add manually (no photo)
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: ANALYZING */}
          {step === 'analyzing' && (
            <div className="py-4 space-y-6 text-center">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] max-h-72 mx-auto max-w-md bg-slate-100 dark:bg-slate-800">
                <FoodImage
                  src={photoPreview}
                  alt="Meal being analyzed"
                  className="w-full h-full"
                />
                {/* Smooth scanning overlay */}
                <div
                  className="absolute inset-0 bg-slate-950/25 pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-x-0 top-0 h-1/2 pointer-events-none animate-scan-line"
                  aria-hidden="true"
                >
                  <div className="h-1 w-full bg-green-400 shadow-[0_0_16px_rgba(74,222,128,0.9)]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-display font-semibold text-lg">
                  <RefreshCw size={18} className="animate-spin" aria-hidden="true" />
                  <span>Identifying your food...</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Looking at ingredients and estimating approximate serving weights.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2.5 animate-pulse" aria-hidden="true">
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 w-4/5 mx-auto" />
              </div>
            </div>
          )}

          {/* ERROR STATE: UPLOAD / API FAILED */}
          {step === 'error' && (
            <div className="py-6 text-center space-y-5 max-w-md mx-auto">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                <AlertCircle size={24} aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  We couldn&apos;t analyze that photo
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {analysisError || 'Something went wrong while contacting the food recognition service.'}
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={runAnalysis}
                  className="w-full min-h-[48px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Retry analysis
                </button>
                <button
                  type="button"
                  onClick={handleUseFallbackEstimate}
                  className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors"
                >
                  Continue with sample estimate
                </button>
                <button
                  type="button"
                  onClick={switchToManualMode}
                  className="w-full min-h-[44px] rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Enter meal manually instead
                </button>
              </div>
            </div>
          )}

          {/* ERROR STATE: NO FOOD DETECTED */}
          {step === 'no-food' && (
            <div className="py-6 text-center space-y-5 max-w-md mx-auto">
              {photoPreview && (
                <FoodImage
                  src={photoPreview}
                  alt="Uploaded photo with no food detected"
                  className="w-36 h-28 rounded-2xl mx-auto"
                />
              )}
              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  No food detected in this photo
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Try snapping a clearer shot of your plate in good lighting, or log this meal manually below.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(undefined);
                    setPhotoBase64(null);
                    setStep('capture');
                  }}
                  className="flex-1 min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Try another photo
                </button>
                <button
                  type="button"
                  onClick={switchToManualMode}
                  className="flex-1 min-h-[48px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors"
                >
                  Enter manually
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW RESULTS & MANUAL ENTRY */}
          {step === 'review' && (
            <div className="space-y-5">
              {/* Top Photo + Big Estimated Calories Summary */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800">
                {photoPreview && (
                  <FoodImage
                    src={photoPreview}
                    alt="Meal photo"
                    className="w-full sm:w-28 h-40 sm:h-24 rounded-xl"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Estimated total</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Approximate
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                      {finalCalories.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      kcal
                    </span>
                  </div>

                  {/* Override toggle / input */}
                  {overrideEnabled ? (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <label htmlFor="override-kcal" className="sr-only">
                        Override total calories
                      </label>
                      <input
                        id="override-kcal"
                        type="number"
                        min={0}
                        max={8000}
                        value={overrideValue}
                        onChange={(e) => setOverrideValue(e.target.value)}
                        placeholder={String(calculatedCalories)}
                        className="w-28 min-h-[40px] px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOverrideEnabled(false);
                          setOverrideValue('');
                        }}
                        className="min-h-[40px] px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 inline-flex items-center gap-1"
                      >
                        <RotateCcw size={13} aria-hidden="true" />
                        Use calculated ({calculatedCalories})
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setOverrideEnabled(true);
                        setOverrideValue(String(calculatedCalories));
                      }}
                      className="mt-1.5 min-h-[36px] text-xs font-medium text-green-700 dark:text-green-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Edit3 size={13} aria-hidden="true" />
                      Override total calories
                    </button>
                  )}
                </div>
              </div>

              {/* Offline fallback banner if API was unavailable */}
              {usedFallbackNotice && (
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                  <Info size={16} className="shrink-0 mt-0.5 text-slate-500" aria-hidden="true" />
                  <span>
                    Showing a local sample estimate because live recognition was unavailable. You can edit any food or portion below.
                  </span>
                </div>
              )}

              {/* Gentle low-confidence banner (< 50%) */}
              {hasLowConfidence && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/60 text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5"
                >
                  <AlertCircle
                    size={18}
                    className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold">Not sure, please confirm</p>
                    <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                      Confidence was below 50% on at least one item. Tap a closer suggestion below or search for the exact food.
                    </p>
                  </div>
                </div>
              )}

              {/* Multi-item Editable Rows */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Food items ({items.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addAnotherItem}
                    className="min-h-[44px] px-3 rounded-xl text-xs font-semibold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus size={15} aria-hidden="true" />
                    Add item
                  </button>
                </div>

                {items.map((item, idx) => {
                  const itemCalories = calculateItemCalories(item.kcalPer100g, item.grams);
                  const smallG = Math.max(15, Math.round(item.defaultGrams * 0.65));
                  const mediumG = Math.max(20, Math.round(item.defaultGrams));
                  const largeG = Math.max(30, Math.round(item.defaultGrams * 1.4));
                  const sliderMax = Math.max(600, Math.round(item.defaultGrams * 2.5));
                  const isSearching = searchOpenForId === item.id;
                  const searchResults = isSearching ? searchFoodCatalog(searchQuery) : [];

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
                    >
                      {/* Row Header: Name + Calculated Kcal + Remove */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={`item-name-${item.id}`}
                            className="sr-only"
                          >
                            Food name for item {idx + 1}
                          </label>
                          <input
                            id={`item-name-${item.id}`}
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItemField(item.id, { name: e.target.value })
                            }
                            placeholder="Food name"
                            className="w-full font-display font-semibold text-base text-slate-900 dark:text-slate-50 bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-green-600 pb-0.5 transition-colors"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                            {item.kcalPer100g} kcal / 100 g · {item.grams} g
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="font-display text-lg font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                              {itemCalories}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                              kcal
                            </span>
                          </div>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Top 3 Predicted Foods as Selectable Chips */}
                      {item.predictions && item.predictions.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Top matches
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.predictions.slice(0, 3).map((pred) => {
                              const isSelected =
                                item.name.toLowerCase() === pred.label.toLowerCase();
                              const pct = Math.round(pred.confidence * 100);
                              return (
                                <button
                                  key={pred.label}
                                  type="button"
                                  onClick={() => selectPredictionForItem(item.id, pred)}
                                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-2 border transition-colors ${
                                    isSelected
                                      ? 'bg-green-600 border-green-600 text-white'
                                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                  }`}
                                >
                                  {isSelected && <Check size={14} aria-hidden="true" />}
                                  <span>{pred.label}</span>
                                  <span
                                    className={`tabular-nums ${
                                      isSelected
                                        ? 'text-green-100'
                                        : 'text-slate-400 dark:text-slate-500'
                                    }`}
                                  >
                                    {pct}%
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Search a Different Food */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            aria-hidden="true"
                          />
                          <input
                            type="text"
                            value={isSearching ? searchQuery : ''}
                            onFocus={() => {
                              setSearchOpenForId(item.id);
                              setSearchQuery('');
                            }}
                            onChange={(e) => {
                              setSearchOpenForId(item.id);
                              setSearchQuery(e.target.value);
                            }}
                            placeholder="Search a different food..."
                            aria-label={`Search a different food for ${item.name}`}
                            className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                          />
                        </div>

                        {isSearching && (
                          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                            {searchResults.length > 0 ? (
                              searchResults.map((food) => (
                                <button
                                  key={food.id}
                                  type="button"
                                  onClick={() => selectCatalogFoodForItem(item.id, food)}
                                  className="w-full min-h-[44px] px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between gap-2 transition-colors"
                                >
                                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {food.name}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                                    {food.kcalPer100g} kcal/100g
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>No exact match in catalog.</span>
                                {searchQuery.trim() && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateItemField(item.id, { name: searchQuery.trim() });
                                      setSearchOpenForId(null);
                                      setSearchQuery('');
                                    }}
                                    className="font-semibold text-green-700 dark:text-green-400 hover:underline whitespace-nowrap"
                                  >
                                    Use &ldquo;{searchQuery.trim()}&rdquo;
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Portion Selector: Small / Medium / Large + Slider + Grams Input */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            Portion size
                          </span>
                          <div className="flex items-center gap-1.5">
                            <label htmlFor={`grams-${item.id}`} className="sr-only">
                              Portion in grams
                            </label>
                            <input
                              id={`grams-${item.id}`}
                              type="number"
                              min={0}
                              max={2500}
                              value={item.grams}
                              onChange={(e) =>
                                updateItemGrams(item.id, Number(e.target.value) || 0)
                              }
                              className="w-20 min-h-[38px] px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-right text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums"
                            />
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              g
                            </span>
                          </div>
                        </div>

                        <div
                          className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800"
                          role="group"
                          aria-label={`Portion presets for ${item.name}`}
                        >
                          {[
                            { label: 'Small', grams: smallG },
                            { label: 'Medium', grams: mediumG },
                            { label: 'Large', grams: largeG },
                          ].map((preset) => {
                            const active = Math.abs(item.grams - preset.grams) <= 5;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => updateItemGrams(item.id, preset.grams)}
                                className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors ${
                                  active
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                              >
                                {preset.label}{' '}
                                <span className="font-normal opacity-75 tabular-nums">
                                  ({preset.grams}g)
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <input
                          type="range"
                          min={10}
                          max={sliderMax}
                          step={5}
                          value={Math.min(sliderMax, Math.max(10, item.grams))}
                          onChange={(e) => updateItemGrams(item.id, Number(e.target.value))}
                          aria-label={`Adjust grams for ${item.name}`}
                          className="w-full accent-green-600 h-2 cursor-pointer"
                        />

                        {/* Manual kcal/100g editor for custom manual entries */}
                        {isManualEntry && (
                          <div className="flex items-center justify-between text-xs pt-1">
                            <label
                              htmlFor={`kcal100-${item.id}`}
                              className="text-slate-500 dark:text-slate-400"
                            >
                              Energy density (kcal per 100 g)
                            </label>
                            <input
                              id={`kcal100-${item.id}`}
                              type="number"
                              min={0}
                              max={900}
                              value={item.kcalPer100g}
                              onChange={(e) =>
                                updateItemField(item.id, {
                                  kcalPer100g: Math.max(0, Math.min(900, Number(e.target.value) || 0)),
                                })
                              }
                              className="w-20 min-h-[36px] px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-right text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Meal Type & Time Selector */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Meal type
                </p>
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  role="radiogroup"
                  aria-label="Meal type"
                >
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="radio"
                      aria-checked={mealType === type}
                      onClick={() => setMealType(type)}
                      className={`min-h-[44px] px-3 rounded-xl border text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        mealType === type
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label
                      htmlFor="meal-date-input"
                      className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"
                    >
                      Date
                    </label>
                    <input
                      id="meal-date-input"
                      type="date"
                      value={mealDate}
                      onChange={(e) => setMealDate(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 tabular-nums"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="meal-time-input"
                      className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"
                    >
                      Time
                    </label>
                    <input
                      id="meal-time-input"
                      type="time"
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Persistent Disclaimer Note */}
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Calorie estimates are approximate and not medical advice.
              </p>
            </div>
          )}
        </div>

        {/* Sticky Footer Save Button on Review Step */}
        {step === 'review' && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 shrink-0 pb-safe">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={items.length === 0 || items.every((i) => !i.name.trim())}
              className="flex-1 min-h-[48px] px-6 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-sm"
            >
              {editingMeal ? 'Update meal' : `Save meal (${finalCalories.toLocaleString()} kcal)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
