/* eslint-disable no-restricted-globals */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  BarChart3,
  Trash2,
  Edit2,
  X,
  Download,
  Camera,
  FileText,
  MapPin,
  Leaf
} from 'lucide-react';

const STORAGE_KEY = 'treesCensus';

const emptyForm = {
  id: '',
  codePlanta: '',
  specie: '',
  ubicazione: '',
  comune: '',
  provincia: '',
  coordinate: '',
  forza: '',
  diametro: '',
  altezza: '',
  altezzaImpalco: '',
  diaChioma: '',
  stadioFisiologico: '',
  giudizio: 'Buono',
  cpc: 'A',
  monitoraggio: '',
  interventi: '',
  rischio: false,
  apparatoRadicale: '',
  fusto: '',
  chioma: '',
  foto: []
};

const TreeCensusApp = () => {
  const [trees, setTrees] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroGiudizio, setFiltroGiudizio] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [photosModal, setPhotosModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          const normalized = parsed.map((tree) => ({
            ...emptyForm,
            ...tree,
            altezzaImpalco: tree.altezzaImpalco || tree.altezaImpalco || '',
            foto: Array.isArray(tree.foto) ? tree.foto : []
          }));

          setTrees(normalized);
        }
      } catch (error) {
        console.error('Errore caricamento dati:', error);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
  }, [trees]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const getNextId = () => {
    if (trees.length === 0) return '001';

    const maxId = Math.max(
      ...trees.map((tree) => {
        const parsed = parseInt(tree.id, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
      })
    );

    return String(maxId + 1).padStart(3, '0');
  };

  const treesFiltrati = trees.filter((tree) => {
    const search = filtro.toLowerCase();

    const matchSearch =
      (tree.codePlanta || '').toLowerCase().includes(search) ||
      (tree.specie || '').toLowerCase().includes(search) ||
      (tree.comune || '').toLowerCase().includes(search) ||
      (tree.ubicazione || '').toLowerCase().includes(search) ||
      (tree.cpc || '').toLowerCase().includes(search);

    const matchGiudizio = !filtroGiudizio || tree.giudizio === filtroGiudizio;

    return matchSearch && matchGiudizio;
  });

  const stats = {
    totale: trees.length,
    buono: trees.filter((tree) => tree.giudizio === 'Buono').length,
    mediocre: trees.filter((tree) => tree.giudizio === 'Mediocre').length,
    scadente: trees.filter((tree) => tree.giudizio === 'Scadente').length,
    aRischio: trees.filter((tree) => tree.rischio).length,
    conFoto: trees.filter((tree) => tree.foto && tree.foto.length > 0).length,
    altezzaMedia:
      trees.length > 0
        ? (
            trees.reduce((sum, tree) => sum + Number(tree.altezza || 0), 0) /
            trees.length
          ).toFixed(1)
        : '0.0',
    diametroMedio:
      trees.length > 0
        ? (
            trees.reduce((sum, tree) => sum + Number(tree.diametro || 0), 0) /
            trees.length
          ).toFixed(1)
        : '0.0'
  };

  const selectedTree = trees.find((tree) => tree.id === selectedTreeId);

  const getColorGiudizio = (giudizio) => {
    switch (giudizio) {
      case 'Buono':
        return 'bg-green-100 text-green-800';
      case 'Mediocre':
        return 'bg-yellow-100 text-yellow-800';
      case 'Scadente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const parseCoordinates = (coordinate) => {
    if (!coordinate) return null;

    const parts = coordinate
      .split(',')
      .map((value) => value.trim())
      .map(Number);

    if (parts.length !== 2 || parts.some(Number.isNaN)) return null;

    return {
      lat: parts[0],
      lon: parts[1]
    };
  };

  const firstValidCoordinate = trees
    .map((tree) => parseCoordinates(tree.coordinate))
    .find(Boolean);

  const mapUrl = firstValidCoordinate
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${firstValidCoordinate.lon - 0.01},${firstValidCoordinate.lat - 0.01},${firstValidCoordinate.lon + 0.01},${firstValidCoordinate.lat + 0.01}&layer=mapnik&marker=${firstValidCoordinate.lat},${firstValidCoordinate.lon}`
    : 'https://www.openstreetmap.org/export/embed.html?bbox=6.0,36.0,19.0,47.5&layer=mapnik';

  const handleSave = () => {
    if (!formData.codePlanta || !formData.specie || !formData.diametro) {
      window.alert('Compila almeno Cod. Pianta, Specie e Diametro.');
      return;
    }

    if (editingId) {
      setTrees((prevTrees) =>
        prevTrees.map((tree) =>
          tree.id === editingId
            ? {
                ...formData,
                id: editingId,
                foto: formData.foto || []
              }
            : tree
        )
      );
    } else {
      const newTree = {
        ...formData,
        id: getNextId(),
        foto: []
      };

      setTrees((prevTrees) => [...prevTrees, newTree]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (tree) => {
    setFormData({
      ...emptyForm,
      ...tree,
      altezzaImpalco: tree.altezzaImpalco || tree.altezaImpalco || '',
      foto: tree.foto || []
    });
    setEditingId(tree.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Sei sicura di voler eliminare questo albero?')) {
      setTrees((prevTrees) => prevTrees.filter((tree) => tree.id !== id));
    }
  };

  const handleFileUpload = (event, treeId) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target.result;

      setTrees((prevTrees) =>
        prevTrees.map((tree) => {
          if (tree.id !== treeId) return tree;

          return {
            ...tree,
            foto: [
              ...(tree.foto || []),
              {
                id: Date.now(),
                url: dataUrl
              }
            ]
          };
        })
      );
    };

    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (treeId, photoId) => {
    setTrees((prevTrees) =>
      prevTrees.map((tree) => {
        if (tree.id !== treeId) return tree;

        return {
          ...tree,
          foto: (tree.foto || []).filter((photo) => photo.id !== photoId)
        };
      })
    );
  };

  const exportCSV = () => {
    if (trees.length === 0) {
      window.alert('Nessun albero da esportare.');
      return;
    }

    const headers = [
      'ID',
      'Cod. Pianta',
      'Specie',
      'Ubicazione',
      'Comune',
      'Provincia',
      'Coordinate',
      'Forza',
      'Diametro (cm)',
      'Altezza (m)',
      'Altezza impalco (m)',
      'Diametro chioma (m)',
      'Stadio fisiologico',
      'Giudizio',
      'C.P.C.',
      'Monitoraggio',
      'Interventi',
      'A rischio',
      'Apparato radicale',
      'Fusto',
      'Chioma',
      'N. Foto'
    ];

    const rows = trees.map((tree) => [
      tree.id,
      tree.codePlanta,
      tree.specie,
      tree.ubicazione,
      tree.comune,
      tree.provincia,
      tree.coordinate,
      tree.forza,
      tree.diametro,
      tree.altezza,
      tree.altezzaImpalco,
      tree.diaChioma,
      tree.stadioFisiologico,
      tree.giudizio,
      tree.cpc,
      tree.monitoraggio,
      tree.interventi,
      tree.rischio ? 'SÌ' : 'NO',
      tree.apparatoRadicale,
      tree.fusto,
      tree.chioma,
      tree.foto?.length || 0
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell || '').replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `censimento_alberi_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const generatePDF = (tree) => {
    const printWindow = window.open('', '', 'height=700,width=900');

    if (!printWindow) {
      window.alert('Popup bloccato. Abilita i popup per generare la scheda.');
      return;
    }

    const html = `
      <html>
        <head>
          <title>Scheda VTA ${tree.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #1f2937;
            }

            h1 {
              color: #14532d;
              border-bottom: 3px solid #14532d;
              padding-bottom: 10px;
            }

            h2 {
              color: #166534;
              margin-top: 24px;
            }

            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }

            .box {
              background: #f0fdf4;
              padding: 16px;
              border-radius: 8px;
              margin-top: 16px;
            }

            .warning {
              background: #fff7ed;
              border-left: 5px solid #f97316;
              padding: 16px;
              border-radius: 8px;
              margin-top: 16px;
            }

            p {
              line-height: 1.45;
            }

            .footer {
              margin-top: 32px;
              border-top: 1px solid #d1d5db;
              padding-top: 12px;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>

        <body>
          <h1>SCHEDA V.T.A. - Visual Tree Assessment</h1>

          <div class="grid">
            <div>
              <h2>Dati rilievo</h2>
              <p><strong>ID:</strong> ${tree.id || ''}</p>
              <p><strong>Cod. Pianta:</strong> ${tree.codePlanta || ''}</p>
              <p><strong>Data generazione:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
              <p><strong>Ubicazione:</strong> ${tree.ubicazione || ''}</p>
              <p><strong>Comune:</strong> ${tree.comune || ''} ${tree.provincia ? `(${tree.provincia})` : ''}</p>
              <p><strong>Coordinate:</strong> ${tree.coordinate || ''}</p>
            </div>

            <div>
              <h2>Dati dendrometrici</h2>
              <p><strong>Specie:</strong> ${tree.specie || ''}</p>
              <p><strong>Forza:</strong> ${tree.forza || ''}</p>
              <p><strong>Diametro:</strong> ${tree.diametro || ''} cm</p>
              <p><strong>Altezza:</strong> ${tree.altezza || ''} m</p>
              <p><strong>Altezza impalco:</strong> ${tree.altezzaImpalco || ''} m</p>
              <p><strong>Diametro chioma:</strong> ${tree.diaChioma || ''} m</p>
              <p><strong>Stadio fisiologico:</strong> ${tree.stadioFisiologico || ''}</p>
            </div>
          </div>

          <div class="box">
            <h2>Descrizione morfo-fisiologica</h2>
            <p><strong>Apparato radicale:</strong> ${tree.apparatoRadicale || ''}</p>
            <p><strong>Fusto:</strong> ${tree.fusto || ''}</p>
            <p><strong>Chioma:</strong> ${tree.chioma || ''}</p>
          </div>

          <div class="warning">
            <h2>Condizioni generali e prescrizioni</h2>
            <p><strong>Giudizio:</strong> ${tree.giudizio || ''}</p>
            <p><strong>C.P.C.:</strong> ${tree.cpc || ''}</p>
            <p><strong>Monitoraggio:</strong> ${tree.monitoraggio || ''}</p>
            <p><strong>Interventi:</strong> ${tree.interventi || 'Nessuna prescrizione inserita'}</p>
            <p><strong>A rischio:</strong> ${tree.rischio ? 'SÌ' : 'NO'}</p>
          </div>

          <div class="footer">
            <p>Generato da TreeCensusPro.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const clearLocalData = () => {
    if (
      window.confirm(
        'Vuoi cancellare tutti i dati salvati in questo browser? Operazione non reversibile.'
      )
    ) {
      window.localStorage.removeItem(STORAGE_KEY);
      setTrees([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
      <style>{`
        @media print {
          body { background: white; }
        }

        .leaf-icon {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6 border-l-4 border-emerald-600">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl leaf-icon">🌲</div>

              <div>
                <h1 className="text-4xl font-bold text-emerald-900">
                  TreeCensusPro
                </h1>
                <p className="text-emerald-700 text-lg">
                  Censimento alberi e Visual Tree Assessment
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Gestione dati, foto, prescrizioni, CSV e schede PDF.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <BarChart3 size={20} />
              Statistiche
            </button>

            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition font-semibold"
            >
              <MapPin size={20} />
              Mappa
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-semibold"
            >
              <Download size={20} />
              Esporta CSV
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
            >
              <Plus size={20} />
              Nuovo rilievo
            </button>

            <button
              onClick={clearLocalData}
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition font-semibold"
            >
              <Trash2 size={20} />
              Pulisci dati locali
            </button>
          </div>

          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-6 border-t border-gray-200">
              <div className="bg-emerald-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">
                  Totale
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.totale}
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">
                  Buono
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.buono}
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">
                  Mediocre
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.mediocre}
                </p>
              </div>

              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">
                  Scadente
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.scadente}
                </p>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">
                  A rischio
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.aRischio}
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">
                  H. media
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.altezzaMedia} m
                </p>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">
                  Foto
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.conFoto}
                </p>
              </div>
            </div>
          )}
        </div>

        {showMap && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-emerald-900">
                Mappa alberi
              </h2>

              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-gray-200 rounded-lg overflow-hidden h-96">
              <iframe
                title="Mappa alberi"
                width="100%"
                height="100%"
                frameBorder="0"
                src={mapUrl}
                style={{ border: 0 }}
              />
            </div>

            <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Alberi con coordinate:</strong>{' '}
                {trees.filter((tree) => tree.coordinate).length}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {trees
                  .filter((tree) => tree.coordinate)
                  .map((tree) => (
                    <p
                      key={tree.id}
                      className="text-xs bg-white p-2 rounded border border-emerald-200"
                    >
                      <span className="font-semibold">#{tree.id}:</span>{' '}
                      {tree.coordinate}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-h-[90vh] overflow-y-auto max-w-5xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-emerald-900">
                  {editingId ? 'Modifica rilievo' : 'Nuovo rilievo'}
                </h2>

                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Cod. Pianta *
                  </label>
                  <input
                    type="text"
                    value={formData.codePlanta}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        codePlanta: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Specie *
                  </label>
                  <input
                    type="text"
                    value={formData.specie}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        specie: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Es. Pinus pinea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Diametro cm *
                  </label>
                  <input
                    type="number"
                    value={formData.diametro}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        diametro: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Altezza m
                  </label>
                  <input
                    type="number"
                    value={formData.altezza}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        altezza: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Altezza impalco m
                  </label>
                  <input
                    type="number"
                    value={formData.altezzaImpalco}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        altezzaImpalco: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Diametro chioma m
                  </label>
                  <input
                    type="text"
                    value={formData.diaChioma}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        diaChioma: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Es. 6-8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Ubicazione
                  </label>
                  <input
                    type="text"
                    value={formData.ubicazione}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        ubicazione: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Comune
                  </label>
                  <input
                    type="text"
                    value={formData.comune}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        comune: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={formData.provincia}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        provincia: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Es. RM"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Coordinate lat, lon
                  </label>
                  <input
                    type="text"
                    value={formData.coordinate}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        coordinate: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Es. 41.900000, 12.500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Forza
                  </label>
                  <input
                    type="text"
                    value={formData.forza}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        forza: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Stadio fisiologico
                  </label>
                  <input
                    type="text"
                    value={formData.stadioFisiologico}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        stadioFisiologico: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Es. Giovane, adulto, senescente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Giudizio
                  </label>
                  <select
                    value={formData.giudizio}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        giudizio: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option>Buono</option>
                    <option>Mediocre</option>
                    <option>Scadente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    C.P.C.
                  </label>
                  <select
                    value={formData.cpc}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        cpc: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>C/D</option>
                    <option>D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Monitoraggio
                  </label>
                  <input
                    type="text"
                    value={formData.monitoraggio}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        monitoraggio: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Es. Annuale, entro 6 mesi"
                  />
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <input
                    id="rischio"
                    type="checkbox"
                    checked={formData.rischio}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        rischio: event.target.checked
                      })
                    }
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor="rischio"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Albero a rischio
                  </label>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Apparato radicale
                  </label>
                  <textarea
                    value={formData.apparatoRadicale}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        apparatoRadicale: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Fusto
                  </label>
                  <textarea
                    value={formData.fusto}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        fusto: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Chioma
                  </label>
                  <textarea
                    value={formData.chioma}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        chioma: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Interventi / prescrizioni
                  </label>
                  <textarea
                    value={formData.interventi}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        interventi: event.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
                >
                  Salva
                </button>

                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {photosModal && selectedTree && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-emerald-900">
                  Foto albero #{selectedTree.id}
                </h2>

                <button
                  onClick={() => setPhotosModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4">
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer hover:bg-emerald-50">
                  <div className="flex flex-col items-center">
                    <Camera className="text-emerald-600 mb-2" size={24} />
                    <span className="text-sm text-emerald-700 font-semibold">
                      Aggiungi foto
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleFileUpload(event, selectedTree.id)
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(selectedTree.foto || []).map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt="Foto albero"
                      className="w-full h-32 object-cover rounded-lg"
                    />

                    <button
                      onClick={() =>
                        handleDeletePhoto(selectedTree.id, photo.id)
                      }
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {(!selectedTree.foto || selectedTree.foto.length === 0) && (
                <p className="text-center text-gray-500 py-8">
                  Nessuna foto inserita.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cerca
              </label>

              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Codice, specie, comune, ubicazione, CPC..."
                  value={filtro}
                  onChange={(event) => setFiltro(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giudizio
              </label>

              <select
                value={filtroGiudizio}
                onChange={(event) => setFiltroGiudizio(event.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Tutti</option>
                <option value="Buono">Buono</option>
                <option value="Mediocre">Mediocre</option>
                <option value="Scadente">Scadente</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {treesFiltrati.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Leaf size={48} className="mx-auto text-gray-300 mb-4" />

              <p className="text-gray-600 text-lg">
                Nessun albero presente.
              </p>

              <p className="text-gray-500 text-sm mt-2">
                Clicca su “Nuovo rilievo” per inserire la prima scheda.
              </p>
            </div>
          ) : (
            treesFiltrati.map((tree) => (
              <div
                key={tree.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-5 border-l-4 border-emerald-500"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-emerald-900">
                      #{tree.id}
                    </h3>

                    <p className="text-sm text-gray-600 font-semibold italic">
                      {tree.specie || 'Specie non indicata'}
                    </p>

                    <p className="text-xs text-gray-500">
                      {tree.ubicazione || 'Ubicazione non indicata'}
                    </p>
                  </div>

                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-semibold text-gray-700">Ø:</span>{' '}
                      {tree.diametro || '-'} cm |{' '}
                      <span className="font-semibold text-gray-700">H:</span>{' '}
                      {tree.altezza || '-'} m
                    </p>

                    <p>
                      <span className="font-semibold text-gray-700">
                        Forza:
                      </span>{' '}
                      {tree.forza || '-'}
                    </p>

                    <p>
                      <span className="font-semibold text-gray-700">
                        C.P.C.:
                      </span>{' '}
                      {tree.cpc || '-'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getColorGiudizio(
                        tree.giudizio
                      )}`}
                    >
                      {tree.giudizio}
                    </span>

                    {tree.rischio && (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-red-200 text-red-800">
                        ⚠️ A rischio
                      </span>
                    )}

                    <p className="text-xs text-gray-600">
                      Monitoraggio: {tree.monitoraggio || '-'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedTreeId(tree.id);
                        setPhotosModal(true);
                      }}
                      className="flex items-center gap-1 text-teal-600 hover:text-teal-800 text-sm font-semibold"
                    >
                      <Camera size={16} />
                      Foto ({tree.foto?.length || 0})
                    </button>

                    <button
                      onClick={() => generatePDF(tree)}
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm font-semibold"
                    >
                      <FileText size={16} />
                      PDF
                    </button>

                    <button
                      onClick={() => handleEdit(tree)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                    >
                      <Edit2 size={16} />
                      Modifica
                    </button>

                    <button
                      onClick={() => handleDelete(tree.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      <Trash2 size={16} />
                      Elimina
                    </button>
                  </div>
                </div>

                {tree.interventi && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Interventi:</span>{' '}
                      {tree.interventi}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-10 text-gray-600 text-sm border-t pt-6">
          <p>
            Totale alberi:{' '}
            <span className="font-bold text-emerald-700">{trees.length}</span>{' '}
            | Visualizzati:{' '}
            <span className="font-bold text-emerald-700">
              {treesFiltrati.length}
            </span>
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Dati salvati localmente nel browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TreeCensusApp;
