export const getProducts = async () => {
  // MAGIA DOCKER: En vez de salir a internet, atacamos el nombre del contenedor
  // Esto elimina el error ConnectionRefused y hace que la carga sea instantánea.
  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'http://backend-compose:8080/api' 
    : process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${API_URL}/productos/publicos`, { 
      cache: 'no-store' 
    });

    if (!res.ok) return [];

    const data = await res.json();
    
    return data.map((p: any) => ({
        idProducto: p.idProducto,
        nombre: p.nombre,
        descripcion: p.descripcion, 
        precioVenta: p.precioVenta,
        estado: p.estado,
        disponible: p.disponible,
        stock: p.stock,
        imagenUrl: p.imagenUrl 
          ? p.imagenUrl.replace('https://s3.miscelaneasdavid.shop/productos-imagenes', '/media-proxy')
          : null,
    }));
      
  } catch (error) {
    console.error('Error de conexión con el backend:', error);
    return [];
  }
};