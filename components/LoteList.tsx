'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Lote {
  numeroLote: string;
  variedad?: { nombre?: string };
  fechaEnvasado: string | Date;
  qrUrl?: string;
}

const LoteList = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await fetch('/api/lotes');
        const data = await response.json();
        // Normalizar posibles estructuras de datos
        const items: Lote[] = Array.isArray(data) ? data : data?.lotes ?? [];
        setLotes(items);
      } catch {
        setLotes([]);
      }
    };
    fetchLotes();
  }, []);

  if (!lotes.length) {
    return (
      <div>
        <h2 className="text-2xl mb-2">Lotes</h2>
        <p>Cargando...</p>
      </div>
    );
  }

  const renderLote = (lote: Lote) => (
    <li key={lote.numeroLote} className="mb-4">
      <h3 className="text-lg font-semibold">
        <Link href={`/lotes/${lote.numeroLote}`} className="hover:underline">
          {lote.numeroLote}
        </Link>
      </h3>
      <p>Variedad: {lote.variedad?.nombre ?? ''}</p>
      <p>Fecha de Envasado: {new Date(lote.fechaEnvasado).toLocaleDateString()}</p>
      {lote.qrUrl ? (
        <img
          src={lote.qrUrl}
          alt={`QR de ${lote.numeroLote}`}
          style={{ width: 160, height: 160, objectFit: 'cover' }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div style={{ width: 160, height: 160, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          QR no disponible
        </div>
      )}
    </li>
  );

  return (
    <div>
      <h2 className="text-2xl mb-2">Lotes</h2>
      <ul className="list-none p-0 m-0">{lotes.map(renderLote)}</ul>
    </div>
  );
};

export default LoteList;
