import { useEffect, useState } from 'react';
import { adminCatalogApi } from '../../common/apis/adminApi';
import type {
  AdminCategoryDto,
  AdminCategoryQuery,
  AdminProductDto,
  AdminProductQuery,
  AdminVariantDto,
  CategoryStatus,
  CreateCategoryRequest,
  CreateProductRequest,
  CreateVariantRequest,
  FulfillmentType,
  ProductStatus,
  UpdateCategoryRequest,
  UpdateProductRequest,
  UpdateVariantRequest,
  VariantStatus,
} from '../../common/models/admin';
import {
  getAdminErrorMessage,
  optionalNullableString,
  optionalNumber,
  optionalString,
  parseLines,
} from '../../common/libs/adminForm';
import { formatCurrency, formatDateTime } from '../../common/libs/formatter';
import { booleanTone, labelFromStatus, orderStatusTone } from '../../common/libs/adminStatus';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { Pagination } from '../../components/Pagination/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/AdminState/AdminState';
import { Button } from '../../components/Button/Button';
import { AdminModal } from '../../components/AdminModal/AdminModal';
import {
  AdminDetailGrid,
  AdminField,
  AdminSelectField,
  AdminTextAreaField,
} from '../../components/AdminForm/AdminForm';
import { useAdminRequestState } from '../../hooks/useAdminRequestState';

const PAGE_SIZE = 20;
const PRODUCT_STATUSES: ProductStatus[] = ['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED'];
const CATEGORY_STATUSES: CategoryStatus[] = ['ACTIVE', 'INACTIVE'];
const VARIANT_STATUSES: VariantStatus[] = ['ACTIVE', 'INACTIVE'];
const FULFILLMENT_TYPES: FulfillmentType[] = ['AUTO', 'MANUAL', 'EXTERNAL'];

type CatalogTab = 'products' | 'categories';
type ModalMode =
  | 'product-create'
  | 'product-edit'
  | 'product-detail'
  | 'category-create'
  | 'category-edit'
  | 'category-detail'
  | 'variant-create'
  | 'variant-edit'
  | null;

interface ProductFormState {
  name: string;
  slug: string;
  description: string;
  imageUrls: string;
  categoryIds: string;
  primaryCategoryId: string;
  status: ProductStatus;
}

interface CategoryFormState {
  name: string;
  slug: string;
  parentId: string;
  status: CategoryStatus;
  description: string;
}

interface VariantFormState {
  sku: string;
  name: string;
  price: string;
  currency: string;
  status: VariantStatus;
  fulfillmentType: FulfillmentType;
  warrantyDays: string;
}

const emptyProductForm: ProductFormState = {
  name: '',
  slug: '',
  description: '',
  imageUrls: '',
  categoryIds: '',
  primaryCategoryId: '',
  status: 'DRAFT',
};

const emptyCategoryForm: CategoryFormState = {
  name: '',
  slug: '',
  parentId: '',
  status: 'ACTIVE',
  description: '',
};

const emptyVariantForm: VariantFormState = {
  sku: '',
  name: '',
  price: '',
  currency: 'VND',
  status: 'ACTIVE',
  fulfillmentType: 'AUTO',
  warrantyDays: '',
};

function productToForm(product: AdminProductDto): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    imageUrls: product.imageUrls?.join('\n') || '',
    categoryIds: product.categories.map((category) => category.id).join('\n'),
    primaryCategoryId: product.primaryCategory?.id || '',
    status: product.status,
  };
}

function categoryToForm(category: AdminCategoryDto): CategoryFormState {
  return {
    name: category.name,
    slug: category.slug,
    parentId: category.parentId || '',
    status: category.status,
    description: category.description || '',
  };
}

function variantToForm(variant: AdminVariantDto): VariantFormState {
  return {
    sku: variant.sku,
    name: variant.name,
    price: variant.price,
    currency: variant.currency,
    status: variant.status,
    fulfillmentType: variant.fulfillmentType,
    warrantyDays: variant.warrantyDays === null ? '' : String(variant.warrantyDays),
  };
}

function toProductPayload(form: ProductFormState): CreateProductRequest | UpdateProductRequest {
  const categoryIds = parseLines(form.categoryIds);
  return {
    name: optionalString(form.name),
    slug: optionalString(form.slug),
    description: optionalString(form.description),
    imageUrls: parseLines(form.imageUrls),
    categoryIds,
    primaryCategoryId: form.primaryCategoryId.trim() ? form.primaryCategoryId.trim() : null,
    status: form.status,
  };
}

function toCategoryPayload(form: CategoryFormState): CreateCategoryRequest | UpdateCategoryRequest {
  return {
    name: optionalString(form.name),
    slug: optionalString(form.slug),
    parentId: optionalNullableString(form.parentId),
    status: form.status,
    description: optionalString(form.description),
  };
}

function toCreateVariantPayload(form: VariantFormState): CreateVariantRequest {
  return {
    sku: form.sku.trim(),
    name: form.name.trim(),
    price: form.price.trim(),
    currency: optionalString(form.currency),
    status: form.status,
    fulfillmentType: form.fulfillmentType,
    warrantyDays: optionalNumber(form.warrantyDays) ?? null,
  };
}

function toUpdateVariantPayload(form: VariantFormState): UpdateVariantRequest {
  return {
    name: optionalString(form.name),
    price: optionalString(form.price),
    status: form.status,
    fulfillmentType: form.fulfillmentType,
    warrantyDays: optionalNumber(form.warrantyDays) ?? null,
  };
}

export default function AdminCatalogPage() {
  const [tab, setTab] = useState<CatalogTab>('products');
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [categories, setCategories] = useState<AdminCategoryDto[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<AdminCategoryDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { loading, setLoading, error, setError, reloadKey, beginRequest, reload } =
    useAdminRequestState();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProductDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AdminCategoryDto | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<AdminVariantDto | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [variantForm, setVariantForm] = useState<VariantFormState>(emptyVariantForm);
  const [saving, setSaving] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<AdminProductDto | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<AdminCategoryDto | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<AdminVariantDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void adminCatalogApi.categories({ page: 1, pageSize: 100 }).then((res) => {
      if (!cancelled) setCategoryOptions(res.items);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;

    if (tab === 'products') {
      const query: AdminProductQuery = { page, pageSize: PAGE_SIZE };
      if (appliedSearch) query.search = appliedSearch;
      if (statusFilter) query.status = statusFilter as ProductStatus;
      if (categoryFilter) query.categoryId = categoryFilter;

      adminCatalogApi
        .products(query)
        .then((res) => {
          if (!cancelled) {
            setProducts(res.items);
            setTotalPages(res.totalPages);
            setError(null);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) setError(getAdminErrorMessage(err, 'Cannot load products.'));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      const query: AdminCategoryQuery = { page, pageSize: PAGE_SIZE };
      if (appliedSearch) query.search = appliedSearch;
      if (statusFilter) query.status = statusFilter as CategoryStatus;

      adminCatalogApi
        .categories(query)
        .then((res) => {
          if (!cancelled) {
            setCategories(res.items);
            setTotalPages(res.totalPages);
            setError(null);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) setError(getAdminErrorMessage(err, 'Cannot load categories.'));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [appliedSearch, categoryFilter, page, reloadKey, setError, setLoading, statusFilter, tab]);

  const switchTab = (next: CatalogTab) => {
    if (next === tab) return;
    beginRequest();
    setTab(next);
    setPage(1);
    setStatusFilter('');
    setCategoryFilter('');
  };

  const applyFilters = () => {
    beginRequest();
    setPage(1);
    setAppliedSearch(search.trim());
    reload();
  };

  const changePage = (nextPage: number) => {
    if (nextPage === page) return;
    beginRequest();
    setPage(nextPage);
  };

  const openProduct = async (product: AdminProductDto, mode: 'product-detail' | 'product-edit') => {
    setModalMode(mode);
    setSelectedProduct(product);
    setProductForm(productToForm(product));
    try {
      const res = await adminCatalogApi.product(product.id);
      setSelectedProduct(res.product);
      setProductForm(productToForm(res.product));
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot load product detail.'));
    }
  };

  const openCategory = async (category: AdminCategoryDto, mode: 'category-detail' | 'category-edit') => {
    setModalMode(mode);
    setSelectedCategory(category);
    setCategoryForm(categoryToForm(category));
    try {
      const res = await adminCatalogApi.category(category.id);
      setSelectedCategory(res.category);
      setCategoryForm(categoryToForm(res.category));
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot load category detail.'));
    }
  };

  const saveProduct = async () => {
    setSaving(true);
    try {
      if (modalMode === 'product-create') {
        await adminCatalogApi.createProduct(toProductPayload(productForm) as CreateProductRequest);
      } else if (modalMode === 'product-edit' && selectedProduct) {
        await adminCatalogApi.updateProduct(selectedProduct.id, toProductPayload(productForm));
      }
      setModalMode(null);
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot save product.'));
    } finally {
      setSaving(false);
    }
  };

  const saveCategory = async () => {
    setSaving(true);
    try {
      if (modalMode === 'category-create') {
        await adminCatalogApi.createCategory(toCategoryPayload(categoryForm) as CreateCategoryRequest);
      } else if (modalMode === 'category-edit' && selectedCategory) {
        await adminCatalogApi.updateCategory(selectedCategory.id, toCategoryPayload(categoryForm));
      }
      setModalMode(null);
      reload();
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot save category.'));
    } finally {
      setSaving(false);
    }
  };

  const openVariantCreate = (product: AdminProductDto) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setVariantForm(emptyVariantForm);
    setModalMode('variant-create');
  };

  const openVariantEdit = (product: AdminProductDto, variant: AdminVariantDto) => {
    setSelectedProduct(product);
    setSelectedVariant(variant);
    setVariantForm(variantToForm(variant));
    setModalMode('variant-edit');
  };

  const saveVariant = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    try {
      if (modalMode === 'variant-create') {
        await adminCatalogApi.createVariant(selectedProduct.id, toCreateVariantPayload(variantForm));
      } else if (modalMode === 'variant-edit' && selectedVariant) {
        await adminCatalogApi.updateVariant(selectedVariant.id, toUpdateVariantPayload(variantForm));
      }
      const res = await adminCatalogApi.product(selectedProduct.id);
      setSelectedProduct(res.product);
      setProducts((current) =>
        current.map((product) => (product.id === res.product.id ? res.product : product)),
      );
      setModalMode('product-detail');
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot save variant.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      if (deletingVariant && selectedProduct) {
        await adminCatalogApi.deleteVariant(deletingVariant.id);
        const res = await adminCatalogApi.product(selectedProduct.id);
        setSelectedProduct(res.product);
        setProducts((current) =>
          current.map((product) => (product.id === res.product.id ? res.product : product)),
        );
      } else if (deletingProduct) {
        await adminCatalogApi.deleteProduct(deletingProduct.id);
        reload();
      } else if (deletingCategory) {
        await adminCatalogApi.deleteCategory(deletingCategory.id);
        reload();
      }
      setDeletingProduct(null);
      setDeletingCategory(null);
      setDeletingVariant(null);
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Cannot delete catalog item.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const categorySelectOptions = [
    { label: 'None', value: '' },
    ...categoryOptions.map((category) => ({
      label: `${category.name} (${category.id})`,
      value: category.id,
    })),
  ];

  const isProductModal =
    modalMode === 'product-create' || modalMode === 'product-edit' || modalMode === 'product-detail';
  const isCategoryModal =
    modalMode === 'category-create' || modalMode === 'category-edit' || modalMode === 'category-detail';
  const isVariantModal = modalMode === 'variant-create' || modalMode === 'variant-edit';

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-white">Catalog</h1>
          <p className="mt-1 text-[13px] text-[#94A3B8]">
            Products, categories and variants backed by admin catalog APIs.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            if (tab === 'products') {
              setSelectedProduct(null);
              setProductForm(emptyProductForm);
              setModalMode('product-create');
            } else {
              setSelectedCategory(null);
              setCategoryForm(emptyCategoryForm);
              setModalMode('category-create');
            }
          }}
        >
          {tab === 'products' ? 'Create product' : 'Create category'}
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        {(['products', 'categories'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => switchTab(key)}
            className={
              tab === key
                ? 'rounded-[10px] bg-[#162033CC] px-3 py-2 text-[12px] font-bold text-white'
                : 'rounded-[10px] border border-white/10 px-3 py-2 text-[12px] font-medium text-[#94A3B8]'
            }
          >
            {key}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-[#0B1020] p-4 md:grid-cols-4">
        <AdminField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder={tab === 'products' ? 'name, slug, sku' : 'name or slug'}
        />
        <AdminSelectField
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: 'All statuses', value: '' },
            ...(tab === 'products' ? PRODUCT_STATUSES : CATEGORY_STATUSES).map((status) => ({
              label: status,
              value: status,
            })),
          ]}
        />
        {tab === 'products' ? (
          <AdminSelectField
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[{ label: 'All categories', value: '' }, ...categorySelectOptions.slice(1)]}
          />
        ) : (
          <div />
        )}
        <div className="flex items-end">
          <Button variant="secondary" size="sm" onClick={applyFilters} className="h-9 w-full">
            Apply
          </Button>
        </div>
      </section>

      {error && <AdminError message={error} onRetry={reload} />}

      {loading ? (
        <AdminLoading />
      ) : tab === 'products' ? (
        products.length === 0 ? (
          <AdminEmpty title="No products" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[900px] text-left text-[13px]">
              <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Variants</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="text-[#DCE4F8]">{product.name}</div>
                      <div className="text-[11px] text-[#566079]">
                        {product.variants.length
                          ? formatCurrency(product.variants[0].price)
                          : 'No price'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8]">{product.slug}</td>
                    <td className="px-4 py-3 text-[#94A3B8]">
                      {product.primaryCategory?.name || product.categories[0]?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-[#DCE4F8]">{product.variants.length}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={orderStatusTone(product.status)} label={labelFromStatus(product.status)} />
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8]">{formatDateTime(product.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => void openProduct(product, 'product-detail')} className="text-[12px] font-bold text-[#0EA5FF] hover:underline">
                          View
                        </button>
                        <button type="button" onClick={() => void openProduct(product, 'product-edit')} className="text-[12px] font-bold text-[#35FFB1] hover:underline">
                          Edit
                        </button>
                        <button type="button" onClick={() => setDeletingProduct(product)} className="text-[12px] font-bold text-[#FF5C5C] hover:underline">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : categories.length === 0 ? (
        <AdminEmpty title="No categories" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[780px] text-left text-[13px]">
            <thead className="border-b border-white/10 bg-[#0B1020] text-[11px] uppercase tracking-wider text-[#566079]">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Parent</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-[#DCE4F8]">{category.name}</td>
                  <td className="px-4 py-3 text-[#94A3B8]">{category.slug}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#94A3B8]">
                    {category.parentId || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={booleanTone(category.status === 'ACTIVE')} label={labelFromStatus(category.status)} />
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">{formatDateTime(category.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => void openCategory(category, 'category-detail')} className="text-[12px] font-bold text-[#0EA5FF] hover:underline">
                        View
                      </button>
                      <button type="button" onClick={() => void openCategory(category, 'category-edit')} className="text-[12px] font-bold text-[#35FFB1] hover:underline">
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeletingCategory(category)} className="text-[12px] font-bold text-[#FF5C5C] hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={changePage} />

      <AdminModal
        open={isProductModal}
        title={modalMode === 'product-create' ? 'Create product' : modalMode === 'product-edit' ? 'Edit product' : 'Product detail'}
        onClose={() => setModalMode(null)}
        footer={
          modalMode === 'product-detail' ? undefined : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setModalMode(null)} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => void saveProduct()} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )
        }
      >
        {modalMode === 'product-detail' && selectedProduct ? (
          <div className="flex flex-col gap-5">
            <AdminDetailGrid
              items={[
                { label: 'ID', value: selectedProduct.id },
                { label: 'Name', value: selectedProduct.name },
                { label: 'Slug', value: selectedProduct.slug },
                { label: 'Status', value: selectedProduct.status },
                { label: 'Primary category', value: selectedProduct.primaryCategory?.name },
                { label: 'Updated', value: formatDateTime(selectedProduct.updatedAt) },
              ]}
            />
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-white">Variants</h3>
                <Button size="sm" onClick={() => openVariantCreate(selectedProduct)}>
                  Create variant
                </Button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[700px] text-left text-[12px]">
                  <thead className="bg-[#07080D] text-[10px] uppercase text-[#566079]">
                    <tr>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Fulfillment</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedProduct.variants.map((variant) => (
                      <tr key={variant.id}>
                        <td className="px-3 py-2 font-mono text-[#94A3B8]">{variant.sku}</td>
                        <td className="px-3 py-2 text-[#DCE4F8]">{variant.name}</td>
                        <td className="px-3 py-2 font-mono text-[#DCE4F8]">{formatCurrency(variant.price)}</td>
                        <td className="px-3 py-2 text-[#94A3B8]">{variant.fulfillmentType}</td>
                        <td className="px-3 py-2">
                          <StatusBadge tone={booleanTone(variant.status === 'ACTIVE')} label={labelFromStatus(variant.status)} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => openVariantEdit(selectedProduct, variant)} className="font-bold text-[#35FFB1] hover:underline">
                              Edit
                            </button>
                            <button type="button" onClick={() => setDeletingVariant(variant)} className="font-bold text-[#FF5C5C] hover:underline">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AdminField label="Name" value={productForm.name} onChange={(e) => setProductForm((current) => ({ ...current, name: e.target.value }))} />
            <AdminField label="Slug" value={productForm.slug} onChange={(e) => setProductForm((current) => ({ ...current, slug: e.target.value }))} />
            <AdminSelectField label="Status" value={productForm.status} onChange={(e) => setProductForm((current) => ({ ...current, status: e.target.value as ProductStatus }))} options={PRODUCT_STATUSES.map((status) => ({ label: status, value: status }))} />
            <AdminSelectField label="Primary category" value={productForm.primaryCategoryId} onChange={(e) => setProductForm((current) => ({ ...current, primaryCategoryId: e.target.value }))} options={categorySelectOptions} />
            <AdminTextAreaField className="md:col-span-2" label="Description" value={productForm.description} onChange={(e) => setProductForm((current) => ({ ...current, description: e.target.value }))} />
            <AdminTextAreaField className="md:col-span-2" label="Image URLs, one per line" value={productForm.imageUrls} onChange={(e) => setProductForm((current) => ({ ...current, imageUrls: e.target.value }))} />
            <AdminTextAreaField className="md:col-span-2" label="Category IDs, one per line" value={productForm.categoryIds} onChange={(e) => setProductForm((current) => ({ ...current, categoryIds: e.target.value }))} />
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={isCategoryModal}
        title={modalMode === 'category-create' ? 'Create category' : modalMode === 'category-edit' ? 'Edit category' : 'Category detail'}
        onClose={() => setModalMode(null)}
        footer={
          modalMode === 'category-detail' ? undefined : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setModalMode(null)} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => void saveCategory()} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )
        }
      >
        {modalMode === 'category-detail' && selectedCategory ? (
          <AdminDetailGrid
            items={[
              { label: 'ID', value: selectedCategory.id },
              { label: 'Name', value: selectedCategory.name },
              { label: 'Slug', value: selectedCategory.slug },
              { label: 'Parent ID', value: selectedCategory.parentId },
              { label: 'Status', value: selectedCategory.status },
              { label: 'Description', value: selectedCategory.description },
              { label: 'Updated', value: formatDateTime(selectedCategory.updatedAt) },
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AdminField label="Name" value={categoryForm.name} onChange={(e) => setCategoryForm((current) => ({ ...current, name: e.target.value }))} />
            <AdminField label="Slug" value={categoryForm.slug} onChange={(e) => setCategoryForm((current) => ({ ...current, slug: e.target.value }))} />
            <AdminSelectField label="Parent" value={categoryForm.parentId} onChange={(e) => setCategoryForm((current) => ({ ...current, parentId: e.target.value }))} options={categorySelectOptions} />
            <AdminSelectField label="Status" value={categoryForm.status} onChange={(e) => setCategoryForm((current) => ({ ...current, status: e.target.value as CategoryStatus }))} options={CATEGORY_STATUSES.map((status) => ({ label: status, value: status }))} />
            <AdminTextAreaField className="md:col-span-2" label="Description" value={categoryForm.description} onChange={(e) => setCategoryForm((current) => ({ ...current, description: e.target.value }))} />
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={isVariantModal}
        title={modalMode === 'variant-create' ? 'Create variant' : 'Edit variant'}
        onClose={() => setModalMode('product-detail')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalMode('product-detail')} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void saveVariant()} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {modalMode === 'variant-create' && (
            <AdminField label="SKU" value={variantForm.sku} onChange={(e) => setVariantForm((current) => ({ ...current, sku: e.target.value }))} />
          )}
          <AdminField label="Name" value={variantForm.name} onChange={(e) => setVariantForm((current) => ({ ...current, name: e.target.value }))} />
          <AdminField label="Price" value={variantForm.price} onChange={(e) => setVariantForm((current) => ({ ...current, price: e.target.value }))} />
          <AdminField label="Currency" value={variantForm.currency} onChange={(e) => setVariantForm((current) => ({ ...current, currency: e.target.value }))} disabled={modalMode === 'variant-edit'} />
          <AdminSelectField label="Status" value={variantForm.status} onChange={(e) => setVariantForm((current) => ({ ...current, status: e.target.value as VariantStatus }))} options={VARIANT_STATUSES.map((status) => ({ label: status, value: status }))} />
          <AdminSelectField label="Fulfillment" value={variantForm.fulfillmentType} onChange={(e) => setVariantForm((current) => ({ ...current, fulfillmentType: e.target.value as FulfillmentType }))} options={FULFILLMENT_TYPES.map((type) => ({ label: type, value: type }))} />
          <AdminField label="Warranty days" value={variantForm.warrantyDays} onChange={(e) => setVariantForm((current) => ({ ...current, warrantyDays: e.target.value }))} />
        </div>
      </AdminModal>

      <ConfirmDialog
        open={deletingProduct !== null || deletingCategory !== null || deletingVariant !== null}
        title="Delete catalog item"
        description={`Delete ${deletingProduct?.name || deletingCategory?.name || deletingVariant?.name || 'this item'}?`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeletingProduct(null);
          setDeletingCategory(null);
          setDeletingVariant(null);
        }}
      />
    </div>
  );
}
