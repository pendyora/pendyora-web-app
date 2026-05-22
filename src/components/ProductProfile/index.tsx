/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Image } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import SwiperCore from 'swiper';
import { Virtual, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { YotpoReviewsRefresh } from '@/hook/useYotpo';
import { apiAddToWishList, apiDeleteFromWishList } from '@/services/cartService';
import {
  clearSelectedProduct,
  setProductsRows,
  setProductStack,
  setSelectedAppraisal,
  setSelectedEngraving,
  setSelectedRingSizeId,
  setSelectedRingSizeRedux,
  setSelectedWarranty,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { fetchWishListProducts, setWishlistProducts } from '@/store/slices/Cart/cartSlice';
import { setSelectedDiamondStore, setSelectedSettingSkuData, setSelectedSettingStore } from '@/store/slices/customProducts/customProductSlice';
import { formatCurrency } from '@/utils/common';
import { trackAddToWishlist } from '@/utils/metaPixel';

import { Text } from './..';
import ProductName from './ProductName';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface SpecialProductTitle {
  id: string;
  title: string;
}
interface Props {
  className?: string;
  productImage?: string;
  productFullTitle?: string;
  stackable_image?: string;
  productHoverImage?: string;
  productName?: React.ReactNode;
  productDescription?: React.ReactNode;
  productPrice?: React.ReactNode;
  isStatic?: boolean;
  isWishlist?: string | null;
  selectionRoute?: string | null;
  slug?: string;
  variation_to_show?: any;
  variation_details?: any;
  jewelryDetails?: any;
  jewelryTypeData?: string;
  discount_type?: string | null;
  discount_value?: number | string | null;
  discounted_price?: string | null;
  specialProductTitles?: SpecialProductTitle[] | null;
  jewelry_type?: string;
  sku_master_id?: string;
  jewelry_id?: string;
  handling_days?: null | number;
  ring_size_id?: null | string;
  metal_type_id?: null | string;
  metal_color_id?: null | string;
  estimated_delivery_days?: number | string | null;
  productVariation?: number | string | null;
  is_customizable?: boolean;
  is_stackable?: boolean;
}

export default function ProductProfile({
  productImage = 'img_group_1259_1.png',
  stackable_image = '/images/no_images.svg',
  productHoverImage = 'img_group_1259_1.png',
  productName = 'NAME OF THE PRODUCT',
  productFullTitle,
  productPrice = '$50',
  productDescription,
  selectionRoute,
  slug,
  sku_master_id,
  jewelry_type,
  jewelry_id,
  variation_to_show = null,
  variation_details = null,
  jewelryDetails = null,
  jewelryTypeData = 'all',
  isWishlist = null,
  isStatic = false,
  handling_days = 0,
  discount_type = null,
  discount_value = null,
  discounted_price = null,
  specialProductTitles = null,
  estimated_delivery_days = null,
  productVariation = null,
  is_customizable = false,
  ring_size_id = null,
  metal_type_id = null,
  metal_color_id = null,
  is_stackable = false,
  ...props
}: Props) {
  const dispatch = useAppDispatch();
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = searchParams.get('state');
  const dId = searchParams.get('did') ?? null;
  const urlPriceRangeParam = searchParams.get('price');

  const { user } = useAppSelector((state) => state.auth.auth);
  const { projectSetting } = useAppSelector((state) => state.master);
  const master = useAppSelector((state) => state.master.data);
  const { productStack, filterData: filtersData } = useAppSelector((state) => state.products);
  const { wishlistProducts } = useAppSelector((state) => state?.cart);
  const products = useAppSelector((state) => state?.products.products.rows);

  const swiperRefs = useRef<SwiperCore[]>([]);
  const [activeMetalTypeIndex, setActiveMetalTypeIndex] = useState<number | null>(1);

  const prevRef0 = useRef<HTMLButtonElement>(null);
  const nextRef0 = useRef<HTMLButtonElement>(null);
  const [isBeginning0, setIsBeginning0] = useState(true);
  const [isEnd0, setIsEnd0] = useState(false);
  const prevRef1 = useRef<HTMLButtonElement>(null);
  const nextRef1 = useRef<HTMLButtonElement>(null);
  const [isBeginning1, setIsBeginning1] = useState(true);
  const [isEnd1, setIsEnd1] = useState(false);
  const prevRef2 = useRef<HTMLButtonElement>(null);
  const nextRef2 = useRef<HTMLButtonElement>(null);
  const [isBeginning2, setIsBeginning2] = useState(true);
  const [isEnd2, setIsEnd2] = useState(false);

  const prevRefs = [prevRef0, prevRef1, prevRef2];
  const nextRefs = [nextRef0, nextRef1, nextRef2];
  const isBeginnings = [isBeginning0, isBeginning1, isBeginning2];
  const isEnds = [isEnd0, isEnd1, isEnd2];
  const setIsBeginnings = [setIsBeginning0, setIsBeginning1, setIsBeginning2];
  const setIsEnds = [setIsEnd0, setIsEnd1, setIsEnd2];

  const [hovered, setHovered] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(false);
  const [hoverVarient, setHoverVariant] = useState<any>(null);
  const [wishlist, setWishlist] = useState(false);
  const [wId, setWid] = useState<any>(isWishlist);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  // const [isStackedProduct, setIsStackedProduct] = useState(false);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    let timeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100); // Debounce by 100ms
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, []);

  // useEffect(() => {
  //   const result = productStack?.some((el: any) => el.slug === selectedVariant?.sku_slug);
  //   setIsStackedProduct(result);
  // }, [productStack, selectedVariant]);

  const isStackedProduct = useMemo(() => {
    return productStack?.some((el: any) => (hoveredOption ? el.slug === hoverVarient?.sku_slug : el.slug === selectedVariant?.sku_slug));
  }, [productStack, selectedVariant, hoverVarient, hoveredOption]);

  const handleAddtoWishlist = async () => {
    const payload = {
      jewelry_id: jewelry_id as string,
      sku_master_id: sku_master_id as string,
      slug: selectedVariant?.sku_slug as string,
      productDescription,
      productPrice: (selectedVariant?.selling_price as string) ?? productPrice,
      productName,
      productHoverImage: selectedVariant?.carat_images?.[1] ?? productHoverImage,
      productImage: selectedVariant?.carat_images?.[0] ?? productImage,
      discount_type: selectedVariant?.discount_type ?? discount_type,
      discount_value: selectedVariant?.discount_value ?? discount_value,
      discounted_price: selectedVariant?.discounted_price ?? discounted_price,
      // variation_to_show,
      // variation_details,
      jewelryDetails,
      jewelryTypeData,
      specialProductTitles,
      handling_days,
      ring_size_id,
      isWishlist: isWishlist ?? 'true',
      jewelry_type: jewelry_type as string,
      is_customizable,
      isStatic,
      productVariation,
      stackable_image,
      estimated_delivery_days,
      metal_type_id,
      is_stackable,
    };

    // Retrieve cart data from local storage
    const wishlistData = localStorage.getItem('wishListItems');
    const existingWishlist: { name: string; jewelry: (typeof payload)[] }[] = wishlistData ? JSON.parse(wishlistData) : [];

    if (user) {
      if (wId) {
        const response: any = await apiDeleteFromWishList([wId]);

        if (response?.data?.status === 200 || response?.data?.status === 201) {
          // setWishlist(true);
          const updatedProductIndex = products?.findIndex((item: any) => item?.id == jewelry_id);

          if (updatedProductIndex !== undefined && updatedProductIndex > -1) {
            const updatedProduct: any = { ...products[updatedProductIndex] };
            const updatedJewelryDetails = {
              ...updatedProduct.jewelryDetails?.[0],
              wishlist_id: null,
            };

            updatedProduct.jewelryDetails = [updatedJewelryDetails];
            const newProducts = [...products];
            newProducts.splice(updatedProductIndex, 1, updatedProduct);
            dispatch(setProductsRows([...newProducts]));
          }
        }
        if (response) {
          setWid(null);
          dispatch(fetchWishListProducts('all'));
        }
      } else {
        const response: any = await apiAddToWishList([{ jewelry_id, sku_master_id }]);
        const data = response.data.data?.[0];
        if (response?.data?.status === 200 || response?.data?.status === 201) {
          setWishlist(true);
          setWid(data?.id);
          const price = Number(selectedVariant?.discounted_price ?? selectedVariant?.selling_price ?? productPrice ?? 0);
          trackAddToWishlist({
            content_ids: [String(sku_master_id ?? jewelry_id)],
            value: price,
            currency: 'USD',
          });
          const updatedProductIndex = products?.findIndex((item: any) => item?.id == data?.jewelry_id);
          if (updatedProductIndex !== undefined && updatedProductIndex > -1) {
            const updatedProduct: any = { ...products[updatedProductIndex] };
            const updatedJewelryDetails = {
              ...updatedProduct.jewelryDetails?.[0],
              wishlist_id: data.id,
            };
            updatedProduct.jewelryDetails = [updatedJewelryDetails];
            const newProducts = [...products];
            newProducts.splice(updatedProductIndex, 1, updatedProduct);
            dispatch(setProductsRows([...newProducts]));
          }
          dispatch(fetchWishListProducts('all'));
        }
      }
    } else {
      const typeIndex = existingWishlist.findIndex((item) => item.name === jewelry_type);

      if (typeIndex > -1) {
        const productIndex = existingWishlist[typeIndex].jewelry.findIndex((item) => item.jewelry_id === jewelry_id);

        if (productIndex > -1) {
          existingWishlist[typeIndex].jewelry.splice(productIndex, 1);
          setWid(null);
          // Check if the jewelry array is empty and remove the object if it is
          if (existingWishlist[typeIndex].jewelry.length === 0) {
            existingWishlist.splice(typeIndex, 1);
          }
        } else {
          existingWishlist[typeIndex].jewelry.push({
            ...payload,
            isWishlist: 'true',
          });
          setWid('true');
          const price = Number(selectedVariant?.discounted_price ?? selectedVariant?.selling_price ?? payload.productPrice ?? 0);
          trackAddToWishlist({
            content_ids: [String(sku_master_id ?? jewelry_id)],
            value: price,
            currency: 'USD',
          });
        }
      } else {
        existingWishlist.push({
          name: jewelry_type as string,
          jewelry: [payload],
        });
        const price = Number(selectedVariant?.discounted_price ?? selectedVariant?.selling_price ?? payload.productPrice ?? 0);
        trackAddToWishlist({
          content_ids: [String(sku_master_id ?? jewelry_id)],
          value: price,
          currency: 'USD',
        });
      }
      localStorage.setItem('wishListItems', JSON.stringify(existingWishlist));
      dispatch(setWishlistProducts(existingWishlist));
    }
  };
  const EXCLUDED_KEYS = [
    'selling_price',
    'carat_images',
    'sku_slug',
    'sku_id',
    'stackable_image',
    'discount_type',
    'discount_value',
    'discounted_price',
    'center_diamond_id',
  ];
  const AXIS_KEYS = [
    'metal_type_id',
    'metal_color_id',
    'bracelet_length_ids',
    'carat_id',
    'shape_id',
    'ring_size_id',
    'center_diamond_id',
    'accent_diamond_id',
  ];
  const isHiddenAxis = (axisName: any) => typeof axisName === 'string' && axisName.toLowerCase().includes('bracelet_length');
  const findKeyFromValue = (valueToFind: string): string | undefined => {
    for (const obj of variation_details) {
      const foundKey = Object.keys(obj).find((key) => obj[key] === valueToFind);
      if (foundKey) {
        return foundKey;
      }
    }
    return undefined;
  };
  const toComparable = (value: any) => (value === null || value === undefined ? '' : String(value));
  const getVariantPrice = (variant: any) => {
    const rawPrice = variant?.discounted_price ?? variant?.selling_price;
    const parsedPrice = Number(rawPrice);
    return Number.isFinite(parsedPrice) ? parsedPrice : Number.NaN;
  };
  const getActivePriceRange = () => {
    const payloadMin = Number(filtersData?.min_price);
    const payloadMax = Number(filtersData?.max_price);
    if (Number.isFinite(payloadMin) && Number.isFinite(payloadMax)) {
      return { min: Math.min(payloadMin, payloadMax), max: Math.max(payloadMin, payloadMax) };
    }

    if (!urlPriceRangeParam) {
      return null;
    }

    const [minRaw, maxRaw] = urlPriceRangeParam.split('-');
    const min = Number(minRaw);
    const max = Number(maxRaw);

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return null;
    }

    return { min: Math.min(min, max), max: Math.max(min, max) };
  };
  const findVariantMatch = (id: string, id2: string, name: string) => {
    // Build the set of axes the user can actually change via swatches. Hidden axes
    // (bracelet_length when its row is filtered out) are anchored back to jewelryDetails
    // so a previous fallback can't permanently drift them (e.g. L6.5 → L7), which would
    // otherwise leak into every subsequent hover/click.
    const visibleAxisKeys = new Set<string>();
    variation_to_show?.forEach((el: any) => {
      if (isHiddenAxis(el?.name)) {
        return;
      }
      if (el?.name === 'metal_type') {
        visibleAxisKeys.add('metal_color_id');
        visibleAxisKeys.add('metal_type_id');
        return;
      }
      const sampleId = el?.details?.[0];
      if (typeof sampleId === 'string') {
        const foundKey = findKeyFromValue(sampleId);
        if (foundKey) {
          visibleAxisKeys.add(foundKey);
        }
      }
    });

    let newVariant: any = { ...selectedVariant };
    AXIS_KEYS.forEach((key) => {
      if (!visibleAxisKeys.has(key) && jewelryDetails?.[key] !== undefined && jewelryDetails?.[key] !== null) {
        newVariant[key] = jewelryDetails[key];
      }
    });

    let changedKeys: string[] = [];
    if (name === 'metal_type') {
      newVariant = {
        ...newVariant,
        metal_color_id: id,
        metal_type_id: id2,
      };
      changedKeys = ['metal_color_id', 'metal_type_id'];
    } else {
      const foundKey = findKeyFromValue(id);
      if (foundKey) {
        newVariant = {
          ...newVariant,
          [foundKey]: id,
        };
        changedKeys = [foundKey];
      }
    }

    if (changedKeys.length === 0) {
      return null;
    }

    // If the resulting axes line up with jewelryDetails exactly, return the canonical SKU.
    // This is what restores the original price/length when the user hovers/clicks back to
    // jewelryDetails' metal after a fallback selection has drifted selectedVariant.
    const matchesJewelryDetails = AXIS_KEYS.every((key) => {
      if (jewelryDetails?.[key] === undefined || jewelryDetails?.[key] === null) {
        return true;
      }
      return toComparable(newVariant[key]) === toComparable(jewelryDetails[key]);
    });
    if (matchesJewelryDetails) {
      return { ...jewelryDetails };
    }

    // Strict axis match — keeps the user's preserved (visible) axes plus the changed one.
    const strictMatched = variation_details?.find((variation: any) =>
      AXIS_KEYS.every((key) => {
        if (newVariant[key] === undefined || newVariant[key] === null) {
          return true;
        }
        return toComparable(variation?.[key]) === toComparable(newVariant[key]);
      }),
    );
    if (strictMatched) {
      return strictMatched;
    }

    // Fallback: match only the changed axis so a swatch click still produces a useful result
    // when the exact combo isn't shipped (e.g. backend has L6.5 only for one metal).
    return (
      variation_details?.find((variation: any) => changedKeys.every((key) => toComparable(variation?.[key]) === toComparable(newVariant[key]))) ??
      null
    );
  };

  const handleHowerVatiation = (id: string, id2 = '', name: string) => {
    const matched = findVariantMatch(id, id2, name);
    if (matched) {
      setHoverVariant(matched);
    }
  };
  const handleSelectedVatiation = (id: string, id2 = '', name: string) => {
    const matched = findVariantMatch(id, id2, name);
    if (matched) {
      setSelectedVariant(matched);
    }
  };

  useEffect(() => {}, [wishlistProducts?.length]);

  useEffect(() => {
    if (!variation_to_show || variation_to_show?.length === 0 || !variation_details || variation_details?.length === 0) {
      setSelectedVariant({ ...jewelryDetails });
      return;
    }
    const activePriceRange = getActivePriceRange();
    const variationsInPriceRange = activePriceRange
      ? variation_details.filter((variation: any) => {
          const price = getVariantPrice(variation);
          return Number.isFinite(price) && price >= activePriceRange.min && price <= activePriceRange.max;
        })
      : variation_details;
    const scopedVariations = variationsInPriceRange.length > 0 ? variationsInPriceRange : variation_details;

    const mainSkuId = jewelryDetails?.id ?? jewelryDetails?.sku_id ?? null;
    if (mainSkuId) {
      const mainSkuVariation = scopedVariations?.find((variation: any) => toComparable(variation?.sku_id) === toComparable(mainSkuId));
      if (mainSkuVariation) {
        setSelectedVariant(mainSkuVariation);
        return;
      }
    }

    // Match on configurable axes only. Including price/slug/images here causes false negatives
    // whenever jewelryDetails carries a SKU (e.g. a non-standard bracelet length like L6.5) that
    // isn't represented in variation_details, and we end up showing a sibling variation's price.
    const criteriaKeys = AXIS_KEYS.filter((key) => jewelryDetails?.[key] !== undefined && jewelryDetails?.[key] !== null);
    const matchedVariation = scopedVariations?.find((variation: any) =>
      criteriaKeys.every((key) => toComparable(variation?.[key]) === toComparable(jewelryDetails[key])),
    );

    if (matchedVariation) {
      setSelectedVariant(matchedVariation);
      return;
    }

    // No variation row reproduces the jewelryDetails axes exactly (e.g. its bracelet_length isn't
    // in variation_details). Trust jewelryDetails as the canonical SKU so the displayed price,
    // image, and slug match the backend's chosen default instead of a sibling variation's price.
    if (jewelryDetails && Object.keys(jewelryDetails).length > 0) {
      setSelectedVariant({ ...jewelryDetails });
      return;
    }

    const baseVariant = scopedVariations?.[0] ?? variation_details?.[0] ?? { ...jewelryDetails };
    const pricedVariations = scopedVariations.filter((variation: any) => Number.isFinite(getVariantPrice(variation)));
    const minPriceVariation =
      pricedVariations.length > 0
        ? pricedVariations.reduce((minVariation: any, currentVariation: any) =>
            getVariantPrice(currentVariation) < getVariantPrice(minVariation) ? currentVariation : minVariation,
          )
        : null;
    const maxPriceVariation =
      pricedVariations.length > 0
        ? pricedVariations.reduce((maxVariation: any, currentVariation: any) =>
            getVariantPrice(currentVariation) > getVariantPrice(maxVariation) ? currentVariation : maxVariation,
          )
        : null;
    const baseVariantHasPrice = Number.isFinite(getVariantPrice(baseVariant));
    const priceRangeFallback = baseVariantHasPrice ? baseVariant : (minPriceVariation ?? maxPriceVariation ?? baseVariant);

    const metalTypeVariation = variation_to_show?.find((variation: any) => variation?.name === 'metal_type');
    // Prefer the metal carried on jewelryDetails so the highlighted swatch matches the canonical
    // SKU; only fall back to details[1] (then [0]) when jewelryDetails has no usable metal IDs.
    const jewelryDetailsMetalDetail =
      jewelryDetails?.metal_type_id && jewelryDetails?.metal_color_id
        ? metalTypeVariation?.details?.find(
            (d: any) =>
              toComparable(d?.metal_type_id) === toComparable(jewelryDetails?.metal_type_id) &&
              toComparable(d?.metal_color_id) === toComparable(jewelryDetails?.metal_color_id),
          )
        : null;
    const defaultMetalDetail =
      jewelryDetailsMetalDetail ??
      metalTypeVariation?.details?.[Math.min(1, (metalTypeVariation?.details?.length ?? 1) - 1)] ??
      metalTypeVariation?.details?.[0];

    if (defaultMetalDetail && Array.isArray(scopedVariations) && scopedVariations.length > 0) {
      const baseKeys = Object.keys(baseVariant).filter((key) => !EXCLUDED_KEYS.includes(key) && key !== 'metal_color_id' && key !== 'metal_type_id');

      const centerMatchedVariation = scopedVariations.find(
        (variation: any) =>
          toComparable(variation?.metal_color_id) === toComparable(defaultMetalDetail?.metal_color_id) &&
          toComparable(variation?.metal_type_id) === toComparable(defaultMetalDetail?.metal_type_id) &&
          baseKeys.every((key) => toComparable(variation?.[key]) === toComparable(baseVariant?.[key])),
      );

      const centerMetalFallback = scopedVariations.find(
        (variation: any) =>
          toComparable(variation?.metal_color_id) === toComparable(defaultMetalDetail?.metal_color_id) &&
          toComparable(variation?.metal_type_id) === toComparable(defaultMetalDetail?.metal_type_id),
      );

      setSelectedVariant(centerMatchedVariation ?? centerMetalFallback ?? priceRangeFallback);
      return;
    }

    setSelectedVariant(priceRangeFallback);
  }, [jewelryDetails, variation_to_show, variation_details, filtersData?.min_price, filtersData?.max_price, urlPriceRangeParam]);

  useEffect(() => {
    const allWishlistItems = wishlistProducts.flatMap((group: any) => group.jewelry);

    if (allWishlistItems.length === 0) {
      setIsInWishlist(false);
      return;
    }

    const exist = allWishlistItems.some((w: any) => w.jewelry_id === jewelry_id && w.sku_master_id === sku_master_id);

    setIsInWishlist(exist);
  }, [wishlistProducts, isInWishlist]);

  const handleSwiperSlideChange = () => {
    if (!variation_to_show && !selectedVariant) {
      return;
    }
    return variation_to_show?.map((el: any, groupIndex: number) => {
      const groupSize = ['/wishlist', 'premade', '/search'].includes(path)
        ? windowWidth <= 768
          ? 3 // md
          : windowWidth <= 1024
            ? 3 // lg
            : windowWidth <= 1536
              ? el?.name == 'metal_type'
                ? 3
                : 4 // xl
              : el?.name == 'metal_type'
                ? 3
                : 5 // 2xl
        : windowWidth < 640
          ? 3 // sm
          : windowWidth <= 768
            ? 3 // md
            : windowWidth <= 1024
              ? 3 // lg
              : windowWidth <= 1536
                ? el?.name == 'metal_type'
                  ? 3
                  : 5 // xl
                : el?.name == 'metal_type'
                  ? 3
                  : 6; // 2xl
      const selectedIndex = el?.details?.findIndex((detailsId: any) => {
        const isMatch =
          el?.name === 'metal_type'
            ? Object.values(selectedVariant || {}).includes(detailsId?.metal_color_id) &&
              Object.values(selectedVariant || {}).includes(detailsId?.metal_type_id)
            : Object.values(selectedVariant || {}).includes(detailsId);
        return isMatch;
      });

      const groupStart = Math.floor(selectedIndex / groupSize) * groupSize;
      const swiper = swiperRefs.current[groupIndex];
      swiper?.slideTo(groupStart);
    });
  };

  useEffect(() => {
    handleSwiperSlideChange();
  }, [variation_to_show, selectedVariant]);

  return (
    <div {...props} className={`${props.className} flex bg-white flex-col items-start gap-3 pb-5 sm:pb-1 lg:gap-3 sm:gap-2 overflow-hidden relative`}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (selectionRoute && state) {
            router.push(`/custom-jewelry?type=${selectionRoute}&state=${state}&id=${selectedVariant?.sku_slug}${dId ? `&did=${dId}` : ''}`);
          } else {
            if (is_stackable) {
              const productDetail = {
                stackId: productStack?.length < 4 ? productStack?.length + 1 : 4,
                productImage: selectedVariant?.carat_images?.[0] ?? productImage,
                stackable_image: selectedVariant?.stackable_image ?? stackable_image,
                productHoverImage: selectedVariant?.carat_images?.[1] ?? productHoverImage,
                productName,
                productPrice: selectedVariant?.selling_price ?? productPrice,
                productFullTitle,
                productDescription,
                slug: selectedVariant?.sku_slug,
                sku_master_id: selectedVariant?.sku_master_id ?? sku_master_id,
                jewelry_type,
                jewelry_id,
                discount_type: selectedVariant?.discount_type ?? discount_type,
                discount_value: selectedVariant?.discount_value ?? discount_value,
                discounted_price: selectedVariant?.discounted_price ?? discounted_price,
                is_customizable,
                isWishlist,
                is_stackable,
                metal_type_id: selectedVariant?.metal_type_id ?? metal_type_id,
                metal_color_id: selectedVariant?.metal_color_id ?? metal_color_id,
                ring_size_id,
                handling_days,
              };
              if (isStackedProduct) {
                const updatedStack = productStack?.filter((item: any) => item.slug !== selectedVariant?.sku_slug);
                dispatch(setProductStack(updatedStack));
              } else {
                const stackProduct = productStack?.length < 4 ? [...productStack, productDetail] : [...productStack]?.toSpliced(3, 1, productDetail);
                dispatch(setProductStack(stackProduct));
              }
            } else {
              router.push(
                path == '/wishlist'
                  ? is_customizable
                    ? `/custom-jewelry?type=2&state=s&id=${selectedVariant?.sku_slug}`
                    : `/${jewelryTypeData}/premade?slug=${selectedVariant?.sku_slug}`
                  : is_customizable
                    ? `/custom-jewelry?type=2&state=s&id=${selectedVariant?.sku_slug}`
                    : `/${jewelryTypeData}/premade?slug=${selectedVariant?.sku_slug}`,
              );
              dispatch(clearSelectedProduct());
              dispatch(setSelectedSettingStore(null));
              dispatch(setSelectedRingSizeRedux(ring_size_id));
              dispatch(setSelectedRingSizeId(ring_size_id));
              dispatch(setSelectedSettingSkuData(null));
              dispatch(setSelectedDiamondStore(null));
              dispatch(setSelectedAppraisal(null));
              dispatch(setSelectedWarranty(null));
              dispatch(setSelectedEngraving(null));
              YotpoReviewsRefresh();
            }
          }
        }}
        className={`relative h-auto w-full ${isStackedProduct && path === '/design-your-ring-stack' ? 'border-2 border-black' : 'border-2 border-transparent'} !aspect-square bg-[#f8f8f8] cursor-pointer`}
      >
        <div className="relative h-auto w-full aspect-square select-none bg-[#f8f8f8]">
          <div
            className={`absolute flex aspect-square top-0 left-0 h-full w-full justify-center transition-opacity duration-500 ease-in-out ${
              productImage !== '/images/no_images.svg' && hovered ? 'opacity-0 md:opacity-100' : 'opacity-100'
            }`}
            style={{
              backgroundColor: '#f8f8f8',
            }}
          >
            <Image
              src={
                hoveredOption
                  ? (hoverVarient?.carat_images?.[0] ?? selectedVariant?.carat_images?.[0] ?? productImage ?? '/images/no_images.svg')
                  : (selectedVariant?.carat_images?.[0] ?? productImage ?? '/images/no_images.svg')
              }
              preview={false}
              className="object-contain relative !h-full"
              alt="Normal Image"
              fallback={'/images/no_images.svg'}
              style={{
                mixBlendMode: 'multiply',
              }}
            />
          </div>
          <div
            className={`absolute flex aspect-square justify-center top-0 left-0 h-full w-full object-contain transition-all duration-500 ease-in-out ${
              productHoverImage !== '/images/no_images.svg' && hovered
                ? 'opacity-100 transform translate-y-0 md:hidden'
                : 'opacity-0 transform -translate-y-3 md:hidden'
            }`}
            style={{
              backgroundColor: '#f8f8f8',
            }}
          >
            <Image
              src={
                hoveredOption
                  ? (hoverVarient?.carat_images?.[1] ?? selectedVariant?.carat_images?.[1] ?? productHoverImage ?? '/images/no_images.svg')
                  : (selectedVariant?.carat_images?.[1] ?? productHoverImage ?? '/images/no_images.svg')
              }
              alt="Hovered Image"
              preview={false}
              className="object-contain !h-full"
              fallback={'/images/no_images.svg'}
              style={{
                mixBlendMode: 'multiply',
              }}
            />
          </div>
          {/* {productVariation && productVariation > '1' ? (
            <div className={`absolute bottom-[0rem] md:w-[42px] sm:w-[38px]  left-0 px-2  sm:text-[12px]`}>
              <Image src={'/images/diamond.svg'} preview={false} alt="Product Variation" />
            </div>
          ) : null} */}
          {(estimated_delivery_days &&
            projectSetting?.fastDeliveryDay &&
            projectSetting?.fastDeliveryDay?.data &&
            projectSetting?.fastDeliveryDay?.data?.delivery_day &&
            estimated_delivery_days <= projectSetting?.fastDeliveryDay?.data?.delivery_day) ||
          (handling_days && handling_days <= 2) ? (
            <div
              className={`absolute bottom-[0rem] md:w-[42px] sm:w-[38px] px-2 ${
                estimated_delivery_days &&
                projectSetting?.fastDeliveryDay &&
                projectSetting?.fastDeliveryDay?.data &&
                projectSetting?.fastDeliveryDay?.data?.delivery_day &&
                productVariation &&
                productVariation > '1' &&
                estimated_delivery_days <= projectSetting?.fastDeliveryDay?.data?.delivery_day
                  ? 'left-10'
                  : 'left-0'
              } sm:text-[12px]`}
            >
              <Image src={'/images/delivery.svg'} preview={false} alt="Delivery" />
            </div>
          ) : null}
          {(hoveredOption ? hoverVarient?.discount_value : selectedVariant?.discount_value) && (
            <div className="absolute bottom-5 sm:bottom-2 left-0 p-1 bg-primary text-text_w sm:text-[10px]">
              {(hoveredOption ? hoverVarient?.discount_value : selectedVariant?.discount_type) &&
              (hoveredOption ? hoverVarient?.discount_type : selectedVariant?.discount_type) == (2 as any)
                ? `${hoveredOption ? hoverVarient?.discount_value : selectedVariant?.discount_value}% off`
                : `$${hoveredOption ? hoverVarient?.discount_value : selectedVariant?.discount_value} off`}
            </div>
          )}
        </div>
        {is_stackable && isStackedProduct && (
          <div className="w-full h-full absolute top-0 left-0 bg-transparent flex items-center justify-center">
            <div className="bg-primary text-white px-2 py-1 w-fit ">Selected</div>
          </div>
        )}
      </div>

      <div className=" flex flex-col items-start">
        <ProductName productName={String(productName)} />

        <div className="flex h-fit mt-2 items-center gap-2 sm:gap-1">
          <Text
            size="textlg"
            as="p"
            className={`!font-castoro ${hoveredOption ? (hoverVarient?.discount_value ? 'line-through text-gray-400 !text-[13px] sm:!text-[11px]' : '') : selectedVariant?.discount_value ? 'line-through text-gray-400 !text-[13px] sm:!text-[11px]' : ''}`}
          >
            {formatCurrency(
              Number(
                (hoveredOption ? hoverVarient?.selling_price : selectedVariant?.selling_price) ??
                  selectedVariant?.selling_price ??
                  jewelryDetails?.selling_price ??
                  productPrice ??
                  0,
              ),
            )}
          </Text>
          {hoveredOption
            ? hoverVarient?.discount_value && (
                <Text size="textlg" as="p" className="!font-castoro tracking-[0.44px] sm:text-[13px]">
                  {formatCurrency(hoveredOption ? hoverVarient?.discounted_price : selectedVariant?.discounted_price)}
                </Text>
              )
            : selectedVariant?.discount_value && (
                <Text size="textlg" as="p" className="!font-castoro tracking-[0.44px] sm:text-[13px]">
                  {formatCurrency(hoveredOption ? hoverVarient?.discounted_price : selectedVariant?.discounted_price)}
                </Text>
              )}
        </div>
      </div>
      {variation_to_show?.length !== 0 && (
        <div className="flex flex-col gap-1">
          {variation_to_show?.map((el: any, variantion_index: number) => {
            const isBraceletLengthAxis = typeof el?.name === 'string' && el.name.toLowerCase().includes('bracelet_length');
            return (
              Object.keys(el).length !== 0 &&
              !isBraceletLengthAxis && (
                <div className="w-full" key={variantion_index}>
                  <div className="grid grid-cols-5 capitalize font-light w-[100%]">
                    <div className="col-span-1 text-[13px] sm:text-[10px] text-left flex items-center">{el?.name?.replaceAll('_', ' ')}</div>
                    <div className="flex gap-1 col-span-4 sm:col-span-4 justify-center relative w-full">
                      <div className={`w-[${windowWidth < 640 ? '70%' : windowWidth <= 1024 ? '80%' : windowWidth <= 1536 ? '85%' : '90%'}]`}>
                        <Swiper
                          modules={[Virtual, Navigation, Pagination]}
                          onSwiper={(swiper) => (swiperRefs.current[variantion_index] = swiper)}
                          onSlideChange={(swiper) => {
                            // Update states on slide change
                            setIsBeginnings[variantion_index](swiper.isBeginning);
                            setIsEnds[variantion_index](swiper.isEnd);

                            // Update active metal type index for middle slide display
                            if (el?.name === 'metal_type') {
                              const slidesPerView = windowWidth < 640 ? 3 : 3; // Match your slidesPerView logic
                              const middleIndex = Math.floor(slidesPerView / 2);
                              setActiveMetalTypeIndex(swiper.activeIndex + middleIndex);
                            }
                          }}
                          loop={false}
                          slidesPerView={
                            ['/wishlist', 'premade', '/search'].includes(path)
                              ? windowWidth <= 768
                                ? 3 // md
                                : windowWidth <= 1024
                                  ? 3 // lg
                                  : windowWidth <= 1536
                                    ? el?.name == 'metal_type'
                                      ? 3
                                      : 4 // xl
                                    : el?.name == 'metal_type'
                                      ? 3
                                      : 5 // 2xl
                              : windowWidth < 640
                                ? 3 // sm
                                : windowWidth <= 768
                                  ? 3 // md
                                  : windowWidth <= 1024
                                    ? 3 // lg
                                    : windowWidth <= 1536
                                      ? el?.name == 'metal_type'
                                        ? 3
                                        : 5 // xl
                                      : el?.name == 'metal_type'
                                        ? 3
                                        : 6 // 2xl
                          }
                          slidesPerGroup={
                            ['/wishlist', 'premade', '/search'].includes(path)
                              ? windowWidth <= 768
                                ? 3 // md
                                : windowWidth <= 1024
                                  ? 3 // lg
                                  : windowWidth <= 1536
                                    ? el?.name == 'metal_type'
                                      ? 3
                                      : 4 // xl
                                    : el?.name == 'metal_type'
                                      ? 3
                                      : 5 // 2xl
                              : windowWidth < 640
                                ? 3 // sm
                                : windowWidth <= 768
                                  ? 3 // md
                                  : windowWidth <= 1024
                                    ? 3 // lg
                                    : windowWidth <= 1536
                                      ? el?.name == 'metal_type'
                                        ? 3
                                        : 5 // xl
                                      : el?.name == 'metal_type'
                                        ? 3
                                        : 6 // 2xl
                          }
                          spaceBetween={4}
                          // pagination={{
                          //   type: 'fraction',
                          // }}
                          navigation={{
                            prevEl: prevRefs[variantion_index].current,
                            nextEl: nextRefs[variantion_index].current,
                          }}
                          virtual
                          className="!w-[100%]"
                          // className=" border border-red-700"
                        >
                          <div className="absolute top-0 left-0  h-full w-[3px] sm:w-[4px] z-10 bg-gradient-to-r from-white"></div>
                          {el?.details?.map((detailsId: any, index: number) => {
                            const mdata = master?.find((item: any) =>
                              el?.name == 'metal_type' ? item.id === detailsId?.metal_color_id : item.id === detailsId,
                            );
                            const metal_types = master?.find((item: any) => item.id === detailsId?.metal_type_id);
                            const isMatch =
                              el?.name === 'metal_type'
                                ? Object.values(selectedVariant || {}).includes(detailsId?.metal_color_id) &&
                                  Object.values(selectedVariant || {}).includes(detailsId?.metal_type_id)
                                : Object.values(selectedVariant || {}).includes(detailsId);
                            const isHoverMatch =
                              el?.name === 'metal_type'
                                ? Object.values(hoverVarient || {}).includes(detailsId?.metal_color_id) &&
                                  Object.values(hoverVarient || {}).includes(detailsId?.metal_type_id)
                                : Object.values(hoverVarient || {}).includes(detailsId);

                            return (
                              <SwiperSlide key={`${index}`} virtualIndex={index} className="!flex !justify-center items-center">
                                <div
                                  className={`flex ${el?.name == 'metal_type' ? 'w-[90%] border' : 'w-fit !aspect-square'} justify-center items-center cursor-pointer border-[0.6px]  !min-w-[40px] sm:!min-w-[30px] overflow-hidden ${isMatch ? 'border-primary' : el?.name == 'metal_type' ? 'border-transparent' : 'border-transparent'} hover:border-primary relative`}
                                  onMouseEnter={() => {
                                    if (windowWidth >= 868) {
                                      setHoveredOption(true);
                                      handleHowerVatiation(
                                        el?.name === 'metal_type' ? detailsId?.metal_color_id : detailsId,
                                        el?.name === 'metal_type' ? detailsId?.metal_type_id : '',
                                        el?.name, // pass the name so the function knows what kind of field this is
                                      );
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (windowWidth >= 868) {
                                      setHoveredOption(false);
                                      handleHowerVatiation(
                                        el?.name === 'metal_type' ? detailsId?.metal_color_id : detailsId,
                                        el?.name === 'metal_type' ? detailsId?.metal_type_id : '',
                                        el?.name, // pass the name so the function knows what kind of field this is
                                      );
                                    }
                                  }}
                                  onClick={() => {
                                    handleSelectedVatiation(
                                      el?.name === 'metal_type' ? detailsId?.metal_color_id : detailsId,
                                      el?.name === 'metal_type' ? detailsId?.metal_type_id : '',
                                      el?.name, // pass the name so the function knows what kind of field this is
                                    );
                                  }}
                                >
                                  {el?.name == 'carat' ? (
                                    <div className="text-[13px] sm:text-[10px] aspect-square flex items-center justify-center">{mdata?.name}</div>
                                  ) : el?.name == 'metal_type' ? (
                                    <div
                                      className={`${el?.name == 'metal_type' ? '!w-[100%] !h-[33px] sm:!w-[100%] sm:!h-[26px]' : '!w-[100%] !h-[28px] sm:!w-[100%] sm:!h-[22px]'} ${'m-[2px]'} object-contain ${mdata?.code == 'RG' ? 'bg-[#D86D7Aa7]' : mdata?.code == 'YG' ? 'bg-[#F7C62Fa7]' : mdata?.code == 'WG' ? 'bg-[#E8E9EDa7]' : 'bg-[#E8E9EDa7]'} flex items-center justify-center`}
                                    >
                                      {el?.name == 'metal_type' &&
                                        (isMatch ||
                                          (hoveredOption && isHoverMatch) ||
                                          (activeMetalTypeIndex !== null && index === activeMetalTypeIndex)) && (
                                          <div className="text-primary text-[14px] lg:text-[13px] sm:text-[10px]">
                                            {metal_types?.code !== 'SILVER_925' ? metal_types?.code : '925'}
                                          </div>
                                        )}
                                    </div>
                                  ) : (
                                    <Image
                                      src={mdata?.image?.[0]}
                                      // height={30}
                                      preview={false}
                                      // width={30}
                                      fallback="/images/no_images.svg"
                                      alt="image"
                                      className={`${el?.name == 'metal_type' ? '!w-[35px] !h-[35px] sm:!w-[28px] sm:!h-[28px]' : '!w-[30px] !h-[30px] sm:!w-[24px]'} sm:!aspect-square object-contain`}
                                      // className={`${productSKU?.metalColor === newObj?.code ? '' : 'opacity-70'} cursor-pointer aspect-square`}
                                    />
                                  )}
                                  {/* {el?.name == 'metal_type' && (isMatch || (hoveredOption && isHoverMatch)) && (
                                    <div className="text-[9px] sm:text-[8px] absolute top-[8%] left-[-36%] w-full text-center bg-primary/70 text-text_w -rotate-45">
                                      {metal_types?.code !== 'SILVER_925' ? metal_types?.code : '925'}
                                    </div>
                                  )} */}
                                </div>
                              </SwiperSlide>
                            );
                          })}
                          <div className="absolute top-0 right-0  h-full w-[3px] sm:w-[4px] z-10 bg-gradient-to-l from-white"></div>
                        </Swiper>
                      </div>
                      <div className="absolute top-[49%] w-full flex justify-between items-center">
                        <button
                          ref={prevRefs[variantion_index]}
                          className={`absolute -left-[5px] xl:left-0 sm:left-0 top-1/2 -translate-y-1/2 z-10 py-1.5 px-0 ${isBeginnings[variantion_index] ? 'opacity-30' : ''}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                          </svg>
                        </button>
                        <button
                          ref={nextRefs[variantion_index]}
                          className={`absolute -right-[5px] xl:right-0 sm:right-0 top-1/2 -translate-y-1/2 z-10 py-1.5 px-0 ${isEnds[variantion_index] ? 'opacity-30' : ''}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            );
          })}
        </div>
      )}

      {Array.isArray(specialProductTitles) && specialProductTitles.length > 0 && (
        <div className="absolute top-4 left-4 flex justify-center items-center gap-1 bg-white/50 rounded-[0.45rem]">
          <span key={specialProductTitles[0].id} className="px-1.5 py-1 bg-primary/10 text-primary sm:text-[10px] rounded-[0.45rem]">
            {specialProductTitles[0].title ?? ''}
          </span>
        </div>
      )}

      <div className="absolute top-0 right-0 sm:top-1 sm:right-1 p-1 pointer-events-auto">
        <button
          type="button"
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="flex min-h-[44px] min-w-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-sm border-0 bg-transparent p-0 text-primary [-webkit-tap-highlight-color:transparent]"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            void handleAddtoWishlist();
          }}
        >
          {isInWishlist ? (
            <FaHeart className="pointer-events-none h-5 w-5 shrink-0" aria-hidden />
          ) : (
            <FaRegHeart className="pointer-events-none h-5 w-5 shrink-0" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
