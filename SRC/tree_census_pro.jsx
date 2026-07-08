import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Map, BarChart3, Trash2, Edit2, X, Download, Camera, FileText, MapPin, Leaf } from 'lucide-react';

const TreeCensusApp = () => {
  const mapContainer = useRef(null);
  const [trees, setTrees] = useState([
    {
      id: '001',
      codePlanta: '16526',
      rilevatore: 'Agr. Dott. Aurelio Valentini',
      specie: 'Cupressus sempervirens',
      ubicazione: 'Villa Torlonia',
      comune: 'Roma',
      provincia: 'RM',
      coordinate: '41.912867, 12.515279',
      forza: 'I^ B',
      diametro: 58,
      altezza: 21,
      altezaImpalco: 2.5,
      diaChioma: '6-8',
      stadioFisiologico: 'Adulto',
      giudizio: 'Scadente',
      cpc: 'C/D',
      monitoraggio: 'Entro 6 mesi',
      interventi: 'Pulizia dell\'area',
      rischio: true,
      apparatoRadicale: 'Non visibile, contrafforti',
      fusto: 'Cancro',
      chioma: 'Stroncamenti, seccaggini',
      foto: []
    },
    {
      id: '002',
      codePlanta: '16527',
      rilevatore: 'Agr. Dott. Aurelio Valentini',
      specie: 'Cupressus sempervirens',
      ubicazione: 'Villa Torlonia',
      comune: 'Roma',
      provincia: 'RM',
      coordinate: '41.912957, 12.515333',
      forza: 'I^ B',
      diametro: 52,
      altezza: 19,
      altezaImpalco: 3,
      diaChioma: '6-8',
      stadioFisiologico: 'Adulto',
      giudizio: 'Scadente',
      cpc: 'C/D',
      monitoraggio: 'Entro 6 mesi',
      interventi: 'Pulizia dell\'area',
      rischio: true,
      apparatoRadicale: 'Non visibile',
      fusto: 'Fusti codominanti, forcella, cancro',
      chioma: 'Stroncamenti, seccaggini',
      foto: []
    },
    {
      id: '003',
      codePlanta: '16528',
      rilevatore: 'Agr. Dott. Aurelio Valentini',
      specie: 'Cupressus sempervirens',
      ubicazione: 'Villa Torlonia',
      comune: 'Roma',
      provincia: 'RM',
      coordinate: '41.913061, 12.515349',
      forza: 'I^ B',
      diametro: 40,
      altezza: 16,
      altezaImpalco: 3,
      diaChioma: '6-8',
      stadioFisiologico: 'Adulto',
      giudizio: 'Scadente',
      cpc: 'C/D',
      monitoraggio: 'Entro 6 mesi',
      interventi: 'Pulizia dell\'area',
      rischio: true,
      apparatoRadicale: 'Non visibile',
      fusto: 'Lesioni, legno disfunzionale, carie',
      chioma: 'Lacunosa',
      foto: []
    }
  ]);

  const [filtro, setFiltro] = useState('');
  const [filtroGiudizio, setFiltroGiudizio] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [photosModal, setPhotosModal] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    codePlanta: '',
    rilevatore: '',
    specie: 'Cupressus sempervirens',
    ubicazione: 'Villa Torlonia',
    comune: 'Roma',
    provincia: 'RM',
    coordinate: '',
    forza: 'I^ B',
    diametro: '',
    altezza: '',
    altezaImpalco: '',
    diaChioma: '6-8',
    stadioFisiologico: 'Adulto',
    giudizio: 'Buono',
    cpc: 'A',
    monitoraggio: 'Annuale',
    interventi: '',
    rischio: false,
    apparatoRadicale: '',
    fusto: '',
    chioma: '',
    foto: []
  });

  // Carica dati dal localStorage
  useEffect(() => {
    const saved = localStorage.getItem('treesCensus');
    if (saved) {
      try {
        setTrees(JSON.parse(saved));
      } catch (e) {
        console.error('Errore caricamento dati', e);
      }
    }
  }, []);

  // Salva dati su localStorage
  useEffect(() => {
    localStorage.setItem('treesCensus', JSON.stringify(trees));
  }, [trees]);

  const treesFiltrati = trees.filter(tree => {
    const matchSearch = 
      tree.codePlanta.toLowerCase().includes(filtro.toLowerCase()) ||
      tree.specie.toLowerCase().includes(filtro.toLowerCase()) ||
      tree.comune.toLowerCase().includes(filtro.toLowerCase());
    
    const matchGiudizio = !filtroGiudizio || tree.giudizio === filtroGiudizio;
    
    return matchSearch && matchGiudizio;
  });

  const handleAddPhoto = (treeId, dataUrl) => {
    setTrees(trees.map(t => {
      if (t.id === treeId) {
        return { ...t, foto: [...(t.foto || []), { id: Date.now(), url: dataUrl }] };
      }
      return t;
    }));
  };

  const handleDeletePhoto = (treeId, photoId) => {
    setTrees(trees.map(t => {
      if (t.id === treeId) {
        return { ...t, foto: t.foto.filter(p => p.id !== photoId) };
      }
      return t;
    }));
  };

  const handleFileUpload = (e, treeId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleAddPhoto(treeId, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (tree) => {
    setFormData(tree);
    setEditingId(tree.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.id || !formData.codePlanta || !formData.diametro) {
      alert('Compila i campi obbligatori');
      return;
    }

    if (editingId) {
      setTrees(trees.map(t => t.id === editingId ? formData : t));
      setEditingId(null);
    } else {
      const newId = (Math.max(...trees.map(t => parseInt(t.id)), 0) + 1).toString().padStart(3, '0');
      setTrees([...trees, { ...formData, id: newId, foto: [] }]);
    }
    
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      codePlanta: '',
      rilevatore: '',
      specie: 'Cupressus sempervirens',
      ubicazione: 'Villa Torlonia',
      comune: 'Roma',
      provincia: 'RM',
      coordinate: '',
      forza: 'I^ B',
      diametro: '',
      altezza: '',
      altezaImpalco: '',
      diaChioma: '6-8',
      stadioFisiologico: 'Adulto',
      giudizio: 'Buono',
      cpc: 'A',
      monitoraggio: 'Annuale',
      interventi: '',
      rischio: false,
      apparatoRadicale: '',
      fusto: '',
      chioma: '',
      foto: []
    });
  };

  const handleDelete = (id) => {
    if (confirm('Sei sicuro di voler eliminare questo albero?')) {
      setTrees(trees.filter(t => t.id !== id));
    }
  };

  const generatePDF = (tree) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: white;">
        <h1 style="color: #2d5016; border-bottom: 3px solid #2d5016; padding-bottom: 10px;">SCHEDA V.T.A. - VISUAL TREE ASSESSMENT</h1>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
          <div>
            <h3 style="color: #2d5016; margin-top: 0;">DATI RILIEVO</h3>
            <p><strong>ID:</strong> ${tree.id}</p>
            <p><strong>Cod. Pianta:</strong> ${tree.codePlanta}</p>
            <p><strong>Rilevatore:</strong> ${tree.rilevatore}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
            <p><strong>Ubicazione:</strong> ${tree.ubicazione}, ${tree.comune} (${tree.provincia})</p>
            <p><strong>Coordinate:</strong> ${tree.coordinate}</p>
          </div>
          
          <div>
            <h3 style="color: #2d5016; margin-top: 0;">DATI DENDROMETRICI</h3>
            <p><strong>Specie:</strong> ${tree.specie}</p>
            <p><strong>Forza:</strong> ${tree.forza}</p>
            <p><strong>Diametro (cm):</strong> ${tree.diametro}</p>
            <p><strong>Altezza (m):</strong> ${tree.altezza}</p>
            <p><strong>Altezza impalco (m):</strong> ${tree.altezaImpalco}</p>
            <p><strong>Diametro chioma (m):</strong> ${tree.diaChioma}</p>
            <p><strong>Stadio fisiologico:</strong> ${tree.stadioFisiologico}</p>
          </div>
        </div>

        <div style="background: #f0f7e8; padding: 15px; margin-top: 20px; border-radius: 5px;">
          <h3 style="color: #2d5016; margin-top: 0;">DESCRIZIONE MORFO-FISIOLOGICA</h3>
          <p><strong>Apparato radicale:</strong> ${tree.apparatoRadicale}</p>
          <p><strong>Fusto:</strong> ${tree.fusto}</p>
          <p><strong>Chioma:</strong> ${tree.chioma}</p>
        </div>

        <div style="background: #fff3cd; padding: 15px; margin-top: 20px; border-radius: 5px; border-left: 4px solid #ffc107;">
          <h3 style="color: #2d5016; margin-top: 0;">CONDIZIONI GENERALI</h3>
          <p><strong>Giudizio:</strong> ${tree.giudizio}</p>
          <p><strong>C.P.C.:</strong> ${tree.cpc}</p>
          <p><strong>Monitoraggio:</strong> ${tree.monitoraggio}</p>
          <p><strong>Interventi:</strong> ${tree.interventi || 'Nessuno'}</p>
          <p><strong>A Rischio:</strong> ${tree.rischio ? 'SÌ ⚠️' : 'NO'}</p>
        </div>

        <div style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px;">
          <p>Generato il: ${new Date().toLocaleString('it-IT')}</p>
          <p>Sistema di Censimento Alberi - Villa Torlonia</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(element.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const exportCSV = () => {
    if (trees.length === 0) {
      alert('Nessun albero da esportare');
      return;
    }

    const headers = [
      'ID', 'Cod. Pianta', 'Specie', 'Rilevatore', 'Ubicazione', 'Comune', 'Provincia',
      'Coordinate', 'Forza', 'Diametro (cm)', 'Altezza (m)', 'Alt. Impalco (m)',
      'Dia. Chioma (m)', 'Stadio Fisiologico', 'Giudizio', 'C.P.C.', 'Monitoraggio',
      'Interventi', 'A Rischio', 'Apparato Radicale', 'Fusto', 'Chioma', 'N. Foto'
    ];

    const rows = trees.map(tree => [
      tree.id,
      tree.codePlanta,
      tree.specie,
      tree.rilevatore,
      tree.ubicazione,
      tree.comune,
      tree.provincia,
      tree.coordinate,
      tree.forza,
      tree.diametro,
      tree.altezza,
      tree.altezaImpalco,
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
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `censimento_alberi_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    totale: trees.length,
    buono: trees.filter(t => t.giudizio === 'Buono').length,
    mediocre: trees.filter(t => t.giudizio === 'Mediocre').length,
    scadente: trees.filter(t => t.giudizio === 'Scadente').length,
    aRischio: trees.filter(t => t.rischio).length,
    altezzaMedia: trees.length > 0 ? (trees.reduce((sum, t) => sum + (t.altezza || 0), 0) / trees.length).toFixed(1) : 0,
    diametroMedio: trees.length > 0 ? (trees.reduce((sum, t) => sum + (t.diametro || 0), 0) / trees.length).toFixed(1) : 0,
    conFoto: trees.filter(t => t.foto && t.foto.length > 0).length
  };

  const getColorGiudizio = (giudizio) => {
    switch(giudizio) {
      case 'Buono': return 'bg-green-100 text-green-800';
      case 'Mediocre': return 'bg-yellow-100 text-yellow-800';
      case 'Scadente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedTree = trees.find(t => t.id === selectedTreeId);

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
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6 border-l-4 border-emerald-600">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl leaf-icon">🌲</div>
              <div>
                <h1 className="text-4xl font-bold text-emerald-900">Censimento Alberi</h1>
                <p className="text-emerald-700 text-lg">Visual Tree Assessment - VTA</p>
                <p className="text-gray-600 text-sm mt-1">Gestione intelligente del patrimonio arboreo</p>
              </div>
            </div>
          </div>

          {/* Azioni principali */}
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
              Mappa GIS
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
              Nuovo Rilievo
            </button>
          </div>

          {/* Statistiche */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-6 border-t border-gray-200">
              <div className="bg-emerald-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">Totale</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.totale}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">Buono</p>
                <p className="text-2xl font-bold text-green-600">{stats.buono}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">Mediocre</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.mediocre}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">Scadente</p>
                <p className="text-2xl font-bold text-red-600">{stats.scadente}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">A Rischio</p>
                <p className="text-2xl font-bold text-orange-600">{stats.aRischio}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">H. Media</p>
                <p className="text-2xl font-bold text-blue-600">{stats.altezzaMedia}m</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600 uppercase font-bold">Con Foto</p>
                <p className="text-2xl font-bold text-purple-600">{stats.conFoto}</p>
              </div>
            </div>
          )}
        </div>

        {/* Mappa GIS */}
        {showMap && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-emerald-900">Mappa degli Alberi</h2>
              <button onClick={() => setShowMap(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="bg-gray-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 p-4 relative">
                <iframe
                  title="Mappa alberi"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=12.51,41.91,12.52,41.92&layer=mapnik&marker=41.913,12.515`}
                  style={{ border: 0, borderRadius: '8px' }}
                />
              </div>
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-700"><strong>Alberi mappati:</strong> {trees.filter(t => t.coordinate).length}</p>
                <p className="text-sm text-gray-700 mt-2"><strong>Coordinate:</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {trees.filter(t => t.coordinate).map(t => (
                    <p key={t.id} className="text-xs bg-white p-2 rounded border border-emerald-200">
                      <span className="font-semibold">#{t.id}:</span> {t.coordinate}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-h-96 overflow-y-auto max-w-3xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-emerald-900">
                  {editingId ? 'Modifica Rilievo' : 'Nuovo Rilievo'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ID *</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    disabled={editingId}
                    className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cod. Pianta *</label>
                  <input
                    type="text"
                    value={formData.codePlanta}
                    onChange={(e) => setFormData({...formData, codePlanta: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Diametro (cm) *</label>
                  <input
                    type="number"
                    value={formData.diametro}
                    onChange={(e) => setFormData({...formData, diametro: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Altezza (m)</label>
                  <input
                    type="number"
                    value={formData.altezza}
                    onChange={(e) => setFormData({...formData, altezza: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Giudizio</label>
                  <select
                    value={formData.giudizio}
                    onChange={(e) => setFormData({...formData, giudizio: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option>Buono</option>
                    <option>Mediocre</option>
                    <option>Scadente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CPC</label>
                  <select
                    value={formData.cpc}
                    onChange={(e) => setFormData({...formData, cpc: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>C/D</option>
                    <option>D</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Coordinate (lat, lon)</label>
                  <input
                    type="text"
                    value={formData.coordinate}
                    onChange={(e) => setFormData({...formData, coordinate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="es: 41.912867, 12.515279"
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
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Foto */}
        {photosModal && selectedTree && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-emerald-900">
                  Foto Albero #{selectedTree.id}
                </h2>
                <button onClick={() => setPhotosModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4">
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer hover:bg-emerald-50">
                  <div className="flex flex-col items-center">
                    <Camera className="text-emerald-600 mb-2" size={24} />
                    <span className="text-sm text-emerald-700 font-semibold">Aggiungi foto</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, selectedTree.id)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedTree.foto && selectedTree.foto.map(photo => (
                  <div key={photo.id} className="relative">
                    <img src={photo.url} alt="Foto albero" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      onClick={() => handleDeletePhoto(selectedTree.id, photo.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {(!selectedTree.foto || selectedTree.foto.length === 0) && (
                <p className="text-center text-gray-500 py-8">Nessuna foto ancora</p>
              )}
            </div>
          </div>
        )}

        {/* Filtri */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cerca</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Codice, specie, comune..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giudizio</label>
              <select
                value={filtroGiudizio}
                onChange={(e) => setFiltroGiudizio(e.target.value)}
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

        {/* Lista Alberi */}
        <div className="space-y-4">
          {treesFiltrati.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Leaf size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">Nessun albero trovato</p>
            </div>
          ) : (
            treesFiltrati.map(tree => (
              <div key={tree.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-5 border-l-4 border-emerald-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <h3 className="font-bold text-lg text-emerald-900">#{tree.id}</h3>
                    <p className="text-sm text-gray-600 font-semibold">{tree.specie}</p>
                    <p className="text-xs text-gray-500">{tree.ubicazione}</p>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><span className="font-semibold text-gray-700">Ø:</span> {tree.diametro} cm | <span className="font-semibold text-gray-700">H:</span> {tree.altezza} m</p>
                    <p><span className="font-semibold text-gray-700">Forza:</span> {tree.forza}</p>
                    <p><span className="font-semibold text-gray-700">CPC:</span> {tree.cpc}</p>
                  </div>

                  <div className="space-y-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getColorGiudizio(tree.giudizio)}`}>
                      {tree.giudizio}
                    </span>
                    {tree.rischio && <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-red-200 text-red-800">⚠️ A Rischio</span>}
                    <p className="text-xs text-gray-600">Monitoraggio: {tree.monitoraggio}</p>
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
                    <p className="text-sm text-gray-700"><span className="font-semibold">Interventi:</span> {tree.interventi}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-gray-600 text-sm border-t pt-6">
          <p>Totale alberi: <span className="font-bold text-emerald-700">{trees.length}</span> | Visualizzati: <span className="font-bold text-emerald-700">{treesFiltrati.length}</span></p>
          <p className="mt-2 text-xs text-gray-500">Dati persistenti su browser • Ultima sincronizzazione: {new Date().toLocaleTimeString('it-IT')}</p>
        </div>
      </div>
    </div>
  );
};

export default TreeCensusApp;
