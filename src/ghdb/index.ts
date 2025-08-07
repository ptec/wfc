export interface ghdb {
  resource: string;
  headers : Record<string, string>;
  token   : string;
}

export function ghdb({
  token, resource
}: {
  token   : string;
  resource: string;
}): ghdb {
  const headers = { 
    "Authorization": `token ${token}`,
    "Accept"       : "application/vnd.github+json",
  } as const

  return {
    resource,
    headers,
    token
  }
}

ghdb.getContents = async function({ headers, resource }: {
  resource: string;
  headers : Record<string, string>;
}) {
  const GET = await fetch(resource, { headers})

  if (!GET.ok)
    throw new Error(`[ghdb.getContents] Failed to read file at '${resource}'`);
  
  return await GET.json();
}

ghdb.putContents = async function(
  { headers, resource }: {
    resource: string;
    headers : Record<string, string>;
  }, 
  content: string, 
  message: string
) {
  const GET = await fetch(resource, { headers });

  if (!GET.ok)
    throw new Error(`[ghdb.putContents] Failed to read file at '${resource}'`);

  const { sha } = await GET.json();

  const PUT = await fetch(resource, {
    method: "PUT",
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content,
      sha
    })
  })

  if (!PUT.ok)
    throw new Error(`[ghdb.putContents] Failed to write file at '${resource}'`);

  return await PUT.json();
}

ghdb.read  = async function(db: ghdb                 ) {
  return JSON.parse(fromBase64((await ghdb.getContents(db)).content)) as ghdb.Data;
}

ghdb.write = async function(db: ghdb, data: ghdb.Data) {
  const message = `[ghdb.write] ${new Date().toISOString()}`;
  const content = toBase64(JSON.stringify(data, null, 2));
  await ghdb.putContents(db, content, message);
  return data;
}

ghdb.patch = async function(db: ghdb, apply: (data: ghdb.Data) => ghdb.Data) {
  const current  = await ghdb.read(db);
  const patched  = apply(current);
  return await ghdb.write(db, patched);
}

export namespace ghdb {
  export interface Data {
    [key: string]: Data | string | number | boolean | null;
  }  
}

function   toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return btoa(String.fromCodePoint(...bytes));
}

function fromBase64(str: string): string {
  const bytes = Uint8Array.from(
    [...atob(str)].map(c => c.charCodeAt(0))
  )
  return new TextDecoder().decode(bytes);
}

export default ghdb;