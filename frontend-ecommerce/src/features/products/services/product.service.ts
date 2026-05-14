export const getProducts = async () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
   // 🔥 CAMBIO AQUÍ: Cambiamos 'next: { revalidate... }' por 'cache: no-store'
    const res = await fetch(`${API_URL}/productos/publicos`, { 
      cache: 'no-store' 
    });

    if (!res.ok) return[];

    const data = await res.json();
    
    return data.map((p: any) => ({
        idProducto: p.idProducto,
        nombre: p.nombre,
        descripcion: p.descripcion, 
        precioVenta: p.precioVenta,
        estado: p.estado,
        disponible: p.disponible,
        
        stock: p.stock, // <--- NUEVA LÍNEA: Recibimos el stock

        imagenUrl: p.imagenUrl 
          ? p.imagenUrl.replace('https://s3.miscelaneasdavid.shop/productos-imagenes', '/media-proxy')
          : null,
    }));
      
  } catch (error) {
    console.error('Error de conexión con el backend:', error);
    return[];
  }
};