import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { PageFormsConfig, StoredFormConfig } from '@/types/form-config';

interface FormTableData {
  id: string;
  name: string;
  type: 'EndOfPost' | 'Sidebar' | 'InLine' | 'PopUp' | 'Floating' | 'Gated';
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  categoryId?: string;
  isGlobal: boolean;
  enabled: boolean;
  submissionCount: number;
  lastModified: string;
  createdAt: string;
  version: number;
}

interface TableResponse {
  forms: FormTableData[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ pageId: string }> }
) {
  const params = await props.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // Sorting parameters
    const sortField = searchParams.get('sortField') || 'lastModified';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    // Filter parameters
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isGlobal = searchParams.get('isGlobal');

    // Get the page with forms config
    const pageData = await db.page.findFirst({
      where: {
        id: params.pageId,
        workspace: {
          members: {
            some: { userId: session.user.id },
          },
        },
      },
      include: {
        categories: true,
      },
    });

    if (!pageData) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const formsConfig = pageData.formsConfig as PageFormsConfig | null;
    if (!formsConfig?.forms || formsConfig.forms.length === 0) {
      return NextResponse.json({
        forms: [],
        totalCount: 0,
        pageCount: 0,
        currentPage: page,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    }

    // Transform forms to table format
    let forms: FormTableData[] = formsConfig.forms.map(
      (form: StoredFormConfig) => ({
        id: form.id,
        name: form.name,
        type: form.config.formType,
        categoryId: form.categoryId,
        isGlobal: form.categoryId === 'global',
        enabled: form.enabled !== false,
        submissionCount: 0, // Will be populated below
        lastModified: form.updatedAt,
        createdAt: form.createdAt,
        version: form.version,
        category: undefined, // Will be populated below
      })
    );

    // Apply filters
    if (search) {
      forms = forms.filter((form) =>
        form.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type && type !== 'all') {
      forms = forms.filter((form) => form.type === type);
    }

    if (category && category !== 'all') {
      if (category === 'global') {
        forms = forms.filter((form) => form.isGlobal);
      } else {
        forms = forms.filter((form) => form.categoryId === category);
      }
    }

    if (isGlobal !== null && isGlobal !== undefined) {
      const globalFilter = isGlobal === 'true';
      forms = forms.filter((form) => form.isGlobal === globalFilter);
    }

    // Get submission counts for all forms in batch
    const formIds = forms.map((form) => form.id);
    const submissionCounts =
      formIds.length > 0
        ? await db.formSubmission.groupBy({
            by: ['formId'],
            where: {
              formId: { in: formIds },
              pageId: params.pageId,
            },
            _count: {
              id: true,
            },
          })
        : [];

    // Create submission count map
    const submissionCountMap = submissionCounts.reduce((acc, item) => {
      acc[item.formId] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Enhance forms with category information and submission counts
    forms = forms.map((form) => {
      // Add category information
      let category = null;
      if (form.categoryId && form.categoryId !== 'global') {
        const categoryData = pageData.categories.find(
          (cat) => cat.id === form.categoryId
        );
        if (categoryData) {
          category = {
            id: categoryData.id,
            name: categoryData.name,
            slug: categoryData.slug,
          };
        }
      }

      return {
        ...form,
        category,
        submissionCount: submissionCountMap[form.id] || 0,
      };
    });

    // Apply sorting
    forms.sort((a, b) => {
      let aValue: any = a[sortField as keyof FormTableData];
      let bValue: any = b[sortField as keyof FormTableData];

      if (sortField === 'lastModified' || sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'name') {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calculate pagination
    const totalCount = forms.length;
    const pageCount = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < pageCount;
    const hasPreviousPage = page > 1;

    // Apply pagination
    const paginatedForms = forms.slice(skip, skip + pageSize);

    const response: TableResponse = {
      forms: paginatedForms,
      totalCount,
      pageCount,
      currentPage: page,
      hasNextPage,
      hasPreviousPage,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching forms table data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
