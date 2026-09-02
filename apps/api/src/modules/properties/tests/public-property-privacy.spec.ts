import { CompanyContactDto } from '@saghf/types';
import {
  adminPropertySelect,
  publicPropertySelect,
  myPropertySelect,
  myPropertyDetailSelect,
  toMyPropertyDetail,
  toPropertyCard,
  toPropertyDetail,
  toMyProperty,
  PublicPropertyRow,
} from '../property.serializer';

/**
 * Regression tests for the hard privacy requirement:
 * public payloads must never carry the owner's phone, email, or exact address.
 */

const FORBIDDEN_KEYS = ['ownerPhone', 'ownerEmail', 'owner', 'phone', 'email', 'address'];

const contact: CompanyContactDto = {
  companyName: 'سقف من',
  primaryPhone: '021-91001234',
  secondaryPhone: null,
  whatsapp: null,
  messengerPhone: null,
  workingHours: 'همه‌روزه از ۹ صبح تا ۹ شب',
  tagline: 'مشاور و مجری املاک',
  socials: {
    telegram: null,
    whatsappLink: null,
    rubika: null,
    bale: null,
    eitaa: null,
    instagram: null,
  },
};

const row = {
  id: 'p1',
  slug: 'apartment-125m-shahrak-gharb-12345',
  code: '12345',
  title: 'آپارتمان ۱۲۵ متری شهرک غرب',
  description: 'توضیحات کامل ملک برای تست حریم خصوصی مالک.',
  area: 125,
  landArea: null,
  rooms: 2,
  bathrooms: 2,
  floor: 6,
  totalFloors: 10,
  constructionYear: 1396,
  parkingCount: 1,
  hasElevator: true,
  hasStorage: true,
  hasBalcony: true,
  deedType: null,
  price: 26_000_000_000n,
  pricePerMeter: 208_000_000n,
  deposit: null,
  monthlyRent: null,
  isNegotiable: false,
  exchangeable: false,
  isFeatured: true,
  viewCount: 245,
  displayAddress: null,
  showExactLocation: false,
  latitude: 35.7575,
  longitude: 51.3702,
  publishedAt: new Date('2026-05-01T00:00:00Z'),
  createdAt: new Date('2026-05-01T00:00:00Z'),
  updatedAt: new Date('2026-05-02T00:00:00Z'),
  status: 'PUBLISHED',
  rejectionReason: null,
  expiresAt: null,
  propertyType: { slug: 'apartment', title: 'آپارتمان' },
  transactionType: { slug: 'sale', title: 'فروش', kind: 'SALE' },
  neighborhood: { slug: 'shahrak-gharb', title: 'شهرک غرب', city: 'تهران' },
  images: [
    { id: 'i1', url: '/api/media/a.webp', width: 1600, height: 1067, isCover: true, order: 0, alt: null },
  ],
  amenities: [{ amenity: { id: 'a1', slug: 'elevator', title: 'آسانسور', icon: 'move-vertical' } }],
} as unknown as PublicPropertyRow;

const deepKeys = (value: unknown, acc: string[] = []): string[] => {
  if (Array.isArray(value)) {
    value.forEach((item) => deepKeys(item, acc));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      acc.push(key);
      deepKeys(child, acc);
    }
  }
  return acc;
};

describe('public property privacy', () => {
  it('does not select the owner relation for public queries', () => {
    expect(Object.keys(publicPropertySelect)).not.toContain('owner');
    expect(Object.keys(publicPropertySelect)).not.toContain('ownerId');
    expect(Object.keys(publicPropertySelect)).not.toContain('address');
  });

  it('does not select the owner relation for the owner-facing query either', () => {
    expect(Object.keys(myPropertySelect)).not.toContain('owner');
  });

  it('lets the owner see their own address but never the owner relation', () => {
    expect(Object.keys(myPropertyDetailSelect)).toContain('address');
    expect(Object.keys(myPropertyDetailSelect)).not.toContain('owner');
    expect(Object.keys(myPropertyDetailSelect)).not.toContain('ownerId');
  });

  it('returns the full edit payload without any owner contact data', () => {
    const detail = toMyPropertyDetail({ ...row, address: 'تهران، شهرک غرب، پلاک ۲۴' } as never);
    expect(detail.address).toContain('شهرک غرب');
    expect(detail.propertyTypeSlug).toBe('apartment');
    expect(detail.amenitySlugs).toEqual(['elevator']);
    expect(JSON.stringify(detail)).not.toContain('0912');
  });

  it('keeps owner.phone reachable only through the admin selection', () => {
    expect(adminPropertySelect.owner.select.phone).toBe(true);
  });

  it('gives the admin selection everything the edit form needs', () => {
    // The admin review screen edits listings, so it reads the same detail
    // payload the owner gets — plus the owner contact block.
    expect(Object.keys(adminPropertySelect)).toContain('address');
    expect(Object.keys(adminPropertySelect)).toContain('description');
    expect(Object.keys(adminPropertySelect)).toContain('amenities');
  });

  it('omits every forbidden key from the public card DTO', () => {
    const keys = deepKeys(toPropertyCard(row));
    FORBIDDEN_KEYS.forEach((key) => expect(keys).not.toContain(key));
  });

  it('omits every forbidden key from the public detail DTO', () => {
    const detail = toPropertyDetail(row, contact);
    const keys = deepKeys({ ...detail, contact: undefined });
    FORBIDDEN_KEYS.forEach((key) => expect(keys).not.toContain(key));
  });

  it('publishes the company phone, not the owner phone', () => {
    const detail = toPropertyDetail(row, contact);
    expect(detail.contact.primaryPhone).toBe('021-91001234');
    expect(JSON.stringify(detail)).not.toContain('0912');
  });

  it('hides exact coordinates when the owner disabled exact location', () => {
    const detail = toPropertyDetail(row, contact);
    expect(detail.latitude).toBeNull();
    expect(detail.longitude).toBeNull();
    expect(detail.displayAddress).toBe('تهران، شهرک غرب');
  });

  it('exposes coordinates only when the owner opted in', () => {
    const detail = toPropertyDetail({ ...row, showExactLocation: true }, contact);
    expect(detail.latitude).toBeCloseTo(35.7575);
  });

  it('exposes moderation fields to the owner without owner contact data', () => {
    const mine = toMyProperty(row as never);
    expect(mine.status).toBe('PUBLISHED');
    expect(deepKeys(mine)).not.toContain('ownerPhone');
  });
});
