import { products } from '../../src/features/products/data.ts';

// Input: optional app products; output: isolated API records, real Responses, and a replaceable fetch boundary.
export function createProductsApi(items = products) {
  // Input: an app product; output: the API field names and integer-cent price.
  const encode = (product) => ({ id: product.id, title: product.name, category_name: product.category,
    price_cents: Math.round(product.price * 100), in_stock: product.inStock, image: product.image, description: product.description });
  let records = items.map(encode);
  const calls = [];
  let failure = 0;
  // Input: request URL/options; output: a fake HTTP response without reaching the real service.
  async function fetch(url, options = {}) {
    const method = options.method ?? 'GET';
    calls.push({ url: String(url), ...options, method });
    if (failure) return Response.json({ error: 'Method not allowed' }, { status: failure });
    const id = Number(String(url).split('/').at(-1));
    if (method === 'GET') return Response.json({ items: records, total: records.length });
    if (method === 'DELETE') {
      // Input: an API item; output: whether it survives the confirmed deletion.
      records = records.filter((item) => item.id !== id);
      return new Response(null, { status: 204 });
    }
    const values = JSON.parse(options.body);
    // Input: an API item; output: its ID for assigning a new server ID.
    const saved = { ...values, id: method === 'POST' ? Math.max(0, ...records.map((item) => item.id)) + 1 : id };
    // Input: an API item; output: the edited record or its unchanged neighbor.
    records = method === 'POST' ? [...records, saved] : records.map((item) => item.id === id ? saved : item);
    return Response.json({ item: saved }, { status: method === 'POST' ? 201 : 200 });
  }
  return { fetch, calls,
    // Input: an HTTP error code, or zero; output: subsequent requests rejected or accepted.
    fail(status) { failure = status; },
  };
}
