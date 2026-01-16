import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("FREE"), // FREE, PRO, PREMIUM, ENTERPRISE, SUPERADMIN
  plan: text("plan").default("FREE"),
  apiKey: text("api_key"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Wallet fields
  walletBalance: real("wallet_balance").default(0), // Saldo acumulado
  pixKey: text("pix_key"), // Chave PIX para saques
  pixKeyType: text("pix_key_type"), // cpf, cnpj, email, phone, random
  isBlocked: integer("is_blocked", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Products table
export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    sku: text("sku").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    price: real("price").notNull().default(0), // Base price from CJ + Hub markup
    supplierPrice: real("supplier_price").default(0), // Original CJ price
    shippingCost: real("shipping_cost").default(0),
    stock: integer("stock").default(0),
    weight: real("weight").default(0), // Product weight in grams
    category: text("category"),
    image: text("image"), // Primary image
    images: text("images"), // JSON array of additional images
    videoUrl: text("video_url"), // URL do video do produto
    rankIndex: integer("rank_index").default(999),
    sourceUrl: text("source_url"),
    active: integer("active", { mode: "boolean" }).default(true),
    // Deals / Promocionais
    originalPrice: real("original_price"), // Preço "de" (para comparação)
    discountPercent: integer("discount_percent").default(0), // % de desconto

    dealEndsAt: text("deal_ends_at"), // Data de término da oferta
    aiMetadata: text("ai_metadata"), // JSON string for Swarm Agent data
    
    // Price Viability / Competitor Analysis
    isPriceViable: integer("is_price_viable", { mode: "boolean" }).default(true),
    competitorMinPrice: real("competitor_min_price"),
    competitorMaxPrice: real("competitor_max_price"),

    // Shopify Mapping
    shopifyProductId: text("shopify_product_id"),
    shopifyVariantId: text("shopify_variant_id"),
    shopifyProductHandle: text("shopify_product_handle"),
    lastSyncedAt: text("last_synced_at"),

    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    rankIdx: index("rank_idx").on(table.rankIndex),
    categoryIdx: index("category_idx").on(table.category),
  })
);

// Product Variants
export const productVariants = sqliteTable(
  "product_variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    name: text("name").notNull(),
    variantProperty: text("variant_property"), // Ex: "Color: Red, Size: M"
    price: real("price").notNull().default(0),
    stock: integer("stock").default(0),
    sku: text("sku"),
    image: text("image"), // Variant-specific image
    shopifyVariantId: text("shopify_variant_id"),
    shopifyInventoryItemId: text("shopify_inventory_item_id"),
  },
  (table) => ({
    productIdx: index("variant_product_idx").on(table.productId),
  })
);

// User Products - Products imported by shop owners with their prices
export const userProducts = sqliteTable(
  "user_products",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    sellingPrice: real("selling_price").notNull(), // Price set by shop owner
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userProductUnique: uniqueIndex("user_product_unique_idx").on(
      table.userId,
      table.productId
    ),
    userIdx: index("user_products_user_idx").on(table.userId),
  })
);

// Sales table
export const sales = sqliteTable(
  "sales",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    productId: text("product_id").references(() => products.id),
    orderId: text("order_id").notNull(),
    productName: text("product_name").notNull(),
    quantity: integer("quantity").notNull().default(1),
    saleValue: real("sale_value").notNull(),
    hubFee: real("hub_fee").default(0), // Amount kept by Hub
    sellerProfit: real("seller_profit").default(0), // Amount for shop owner
    stripePaymentId: text("stripe_payment_id"),
    cjOrderId: text("cj_order_id"), // CJ Dropshipping order ID
    status: text("status").default("pending"), // pending, paid, shipped, delivered
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdx: index("user_sales_idx").on(table.userId),
    statusIdx: index("sales_status_idx").on(table.status),
  })
);

// Notifications
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  type: text("type").notNull(), // LOW_STOCK, PRICE_CHANGE, SYNC_COMPLETE, NEW_SALE
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: text("data"), // JSON string
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Favorites
export const favorites = sqliteTable(
  "favorites",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    productId: text("product_id").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userProductUnique: uniqueIndex("user_product_unique").on(
      table.userId,
      table.productId
    ),
  })
);

// Platform Config (singleton for pricing)
export const platformConfig = sqliteTable("platform_config", {
  id: text("id").primaryKey().default("singleton"),
  markupFree: real("markup_free").default(1.15),
  markupPro: real("markup_pro").default(1.1),
  markupPremium: real("markup_premium").default(1.08),
  markupEnterprise: real("markup_enterprise").default(1.05),
  // Rank limits: which is the minimum rank a user can see
  // Lower rank = better product (1 is best, 500 is worst in active catalog)
  rankLimitFree: integer("rank_limit_free").default(301), // Free: 301-500 (200 products)
  rankLimitPro: integer("rank_limit_pro").default(201), // Pro: 201-500 (300 products)
  rankLimitPremium: integer("rank_limit_premium").default(101), // Premium: 101-500 (400 products)
  rankLimitEnterprise: integer("rank_limit_enterprise").default(1), // Enterprise: 1-500 (500 products)
  // Connect fees per plan (% Hub keeps from each sale)
  connectFeeFree: real("connect_fee_free").default(15), // Free paga 15%
  connectFeePro: real("connect_fee_pro").default(10), // Pro paga 10%
  connectFeePremium: real("connect_fee_premium").default(8), // Premium paga 8%
  connectFeeEnterprise: real("connect_fee_enterprise").default(5), // Enterprise paga 5%
  // Shipping configuration
  shippingCostPerKg: real("shipping_cost_per_kg").default(45), // R$ por KG
  shippingBaseFee: real("shipping_base_fee").default(5), // Taxa base fixa
  shippingHandlingFee: real("shipping_handling_fee").default(5), // Taxa para itens leves
  shippingMinWeight: real("shipping_min_weight").default(100), // Peso mínimo em gramas
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("updated_by"),
});

// Stores table (multi-tenant storefronts)
export const stores = sqliteTable("stores", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // Owner of the store
  subdomain: text("subdomain").notNull().unique(), // minhaloja.oseller.com.br
  name: text("name").notNull(), // "Minha Loja"
  description: text("description"), // "A melhor loja de eletrônicos"
  logo: text("logo"), // URL da logo
  favicon: text("favicon"), // URL do favicon
  // Branding colors
  primaryColor: text("primary_color").default("#3B82F6"), // Azul padrão
  secondaryColor: text("secondary_color").default("#10B981"),
  backgroundColor: text("background_color").default("#FFFFFF"),
  textColor: text("text_color").default("#1F2937"),
  // Contact info
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  instagram: text("instagram"),
  // Settings
  showPrices: integer("show_prices", { mode: "boolean" }).default(true),
  allowCheckout: integer("allow_checkout", { mode: "boolean" }).default(true),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  // Timestamps
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

// Price History
export const priceHistory = sqliteTable("price_history", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  sku: text("sku").notNull(),
  oldPrice: real("old_price").notNull(),
  newPrice: real("new_price").notNull(),
  oldShipping: real("old_shipping").default(0),
  newShipping: real("new_shipping").default(0),
  changePercentage: real("change_percentage").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Withdrawal requests (solicitações de saque)
export const withdrawals = sqliteTable(
  "withdrawals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    amount: real("amount").notNull(),
    pixKey: text("pix_key").notNull(),
    pixKeyType: text("pix_key_type").notNull(),
    status: text("status").default("pending"), // pending, approved, paid, rejected
    notes: text("notes"),
    processedAt: text("processed_at"),
    processedBy: text("processed_by"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdx: index("withdrawals_user_idx").on(table.userId),
    statusIdx: index("withdrawals_status_idx").on(table.status),
  })
);

// Banners Promocionais
export const banners = sqliteTable(
  "banners",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    image: text("image").notNull(), // URL da imagem (recomendado 1920x600)
    ctaText: text("cta_text"), // Texto do botão (ex: 'Ver ofertas')
    ctaLink: text("cta_link"), // Link de destino (ex: '/?category=Eletronicos')
    order: integer("order").default(0), // Ordem de exibição
    active: integer("active", { mode: "boolean" }).default(true),
    startDate: text("start_date"), // Início da exibição (opcional)
    endDate: text("end_date"), // Fim da exibição (opcional)
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    activeIdx: index("banners_active_idx").on(table.active),
    orderIdx: index("banners_order_idx").on(table.order),
  })
);

export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;

// ============================================================================
// MARKETPLACE TABLES (for OSeller integration)
// ============================================================================

// Customers - End customers who buy from stores
export const customers = sqliteTable(
  "customers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    cpf: text("cpf"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailIdx: index("customers_email_idx").on(table.email),
  })
);

// Shipping Addresses
export const shippingAddresses = sqliteTable(
  "shipping_addresses",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id").references(() => customers.id),
    street: text("street").notNull(),
    number: text("number"),
    complement: text("complement"),
    neighborhood: text("neighborhood"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    zipCode: text("zip_code").notNull(),
    country: text("country").default("BR"),
    isDefault: integer("is_default", { mode: "boolean" }).default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    customerIdx: index("shipping_customer_idx").on(table.customerId),
  })
);

// Orders - Marketplace orders
export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id), // Lojista
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id),
    shippingAddressId: text("shipping_address_id").references(
      () => shippingAddresses.id
    ),
    storeId: text("store_id").references(() => stores.id), // Link to store (optional for marketplace orders)
    // Totals
    subtotal: real("subtotal").notNull().default(0),
    shippingCost: real("shipping_cost").default(0),
    total: real("total").notNull().default(0),
    // Fees
    hubFee: real("hub_fee").default(0), // 10% for Hub
    sellerProfit: real("seller_profit").default(0), // Amount for seller
    // Status
    status: text("status").default("pending_payment"),
    // pending_payment, paid, processing, shipped, delivered, refunded, cancelled
    // Payment
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    paidAt: text("paid_at"),
    // Fulfillment
    cjOrderId: text("cj_order_id"),
    shopifyCheckoutId: text("shopify_checkout_id"), // Ghost Store Order ID
    trackingCode: text("tracking_code"),
    trackingUrl: text("tracking_url"),
    shippedAt: text("shipped_at"),
    deliveredAt: text("delivered_at"),
    // Refund
    refundedAt: text("refunded_at"),
    refundReason: text("refund_reason"),
    refundAmount: real("refund_amount"),
    // Wallet
    walletCredited: integer("wallet_credited", { mode: "boolean" }).default(
      false
    ),
    walletReleaseAt: text("wallet_release_at"), // D+15 after delivered
    // Timestamps
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    sellerIdx: index("orders_seller_idx").on(table.sellerId),
    customerIdx: index("orders_customer_idx").on(table.customerId),
    statusIdx: index("orders_status_idx").on(table.status),
  })
);

// Order Items
export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    productName: text("product_name").notNull(),
    productSku: text("product_sku"),
    productImage: text("product_image"),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: real("unit_price").notNull(), // Price per unit in BRL
    totalPrice: real("total_price").notNull(), // quantity * unitPrice
    // Variant info (if applicable)
    variantId: text("variant_id"),
    variantName: text("variant_name"),
  },
  (table) => ({
    orderIdx: index("order_items_order_idx").on(table.orderId),
  })
);

// ============================================================================
// API Keys for external integrations
// ============================================================================

export const apiKeys = sqliteTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    keyHash: text("key_hash").notNull().unique(),
    prefix: text("prefix").notNull(),
    name: text("name").default("Default"),
    lastUsedAt: text("last_used_at"),
    revokedAt: text("revoked_at"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdx: index("api_keys_user_idx").on(table.userId),
  })
);

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

// ============================================================================
// Platform Tokens (OAuth for Mercado Livre, Amazon, etc.)
// ============================================================================

export const platformTokens = sqliteTable(
  "platform_tokens",
  {
    platform: text("platform").primaryKey(), // 'mercadolivre', 'amazon'
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    expiresAt: integer("expires_at").notNull(), // Timestamp in ms
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  }
);

export type PlatformToken = typeof platformTokens.$inferSelect;
export type NewPlatformToken = typeof platformTokens.$inferInsert;

// ============================================================================
// Types export
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type UserProduct = typeof userProducts.$inferSelect;
export type NewUserProduct = typeof userProducts.$inferInsert;
export type Sale = typeof sales.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

// ============================================================================
// Price Sniper (Competitor Monitoring)
// ============================================================================

export const competitorPrices = sqliteTable(
  "competitor_prices",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    competitorName: text("competitor_name").notNull(),
    competitorUrl: text("competitor_url"),
    price: real("price").notNull(),
    lastCheckedAt: text("last_checked_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    productIdx: index("competitor_prices_product_idx").on(table.productId),
  })
);


export type CompetitorPrice = typeof competitorPrices.$inferSelect;
export type NewCompetitorPrice = typeof competitorPrices.$inferInsert;

// ============================================================================
// Trend Matcher (VIP Products)
// ============================================================================

export const trendingProducts = sqliteTable(
  "trending_products",
  {
    id: text("id").primaryKey(),
    source: text("source").notNull(), // 'amazon', 'aliexpress', 'google_trends'
    externalId: text("external_id"),
    name: text("name").notNull(),
    category: text("category"),
    rank: integer("rank"),
    priceUsd: real("price_usd"),
    imageUrl: text("image_url"),
    sourceUrl: text("source_url"),
    fetchedAt: text("fetched_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    sourceIdx: index("trending_source_idx").on(table.source),
    rankIdx: index("trending_rank_idx").on(table.rank),
  })
);

export const productMatches = sqliteTable(
  "product_matches",
  {
    id: text("id").primaryKey(),
    trendingProductId: text("trending_product_id")
      .notNull()
      .references(() => trendingProducts.id),
    cjProductId: text("cj_product_id")
      .notNull()
      .references(() => products.id),
    matchScore: real("match_score").default(0),
    matchMethod: text("match_method"), // 'keyword', 'embedding', 'manual'
    isVerified: integer("is_verified", { mode: "boolean" }).default(false),
    isVip: integer("is_vip", { mode: "boolean" }).default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    trendingIdx: index("matches_trending_idx").on(table.trendingProductId),
    cjIdx: index("matches_cj_idx").on(table.cjProductId),
    vipIdx: index("matches_vip_idx").on(table.isVip),
  })
);

export type TrendingProduct = typeof trendingProducts.$inferSelect;
export type NewTrendingProduct = typeof trendingProducts.$inferInsert;
export type ProductMatch = typeof productMatches.$inferSelect;
export type NewProductMatch = typeof productMatches.$inferInsert;

// ============================================================================
// Product Rank History (Analytics)
// ============================================================================

export const productRankHistory = sqliteTable(
  "product_rank_history",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    rankIndex: integer("rank_index").notNull(),
    score: real("score").notNull(),
    price: real("price"),
    stock: integer("stock"),
    salesCount: integer("sales_count"), // Snapshot of sales at this time (if needed/avail)
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    productIdx: index("rank_history_product_idx").on(table.productId),
    createdIdx: index("rank_history_created_idx").on(table.createdAt),
  })
);

export type ProductRankHistory = typeof productRankHistory.$inferSelect;
export type NewProductRankHistory = typeof productRankHistory.$inferInsert;
