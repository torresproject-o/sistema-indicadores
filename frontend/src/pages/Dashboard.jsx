import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import Navigation from '../components/Navigation';
import { Upload, TrendingUp, DollarSign, Activity } from 'lucide-react';

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [kpis, setKpis] = useState({ total_ingresos: 0, total_transacciones: 0, ticket_promedio: 0 });
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [kpiRes, timeRes, catRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/sales-over-time'),
        api.get('/dashboard/sales-by-category')
      ]);
      setKpis(kpiRes.data);
      setSalesOverTime(timeRes.data.map(item => ({ ...item, total: Number(item.total) })));
      setSalesByCategory(catRes.data.map(item => ({ ...item, value: Number(item.value) })));
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      setMessage({ type: 'danger', text: 'Error al cargar los datos del dashboard.' });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'warning', text: 'Por favor, selecciona un archivo.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ type: 'success', text: 'Archivo cargado y procesado exitosamente.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      setFile(null);
      // Restablecer entrada
      document.getElementById('formFile').value = '';
      // Actualizar datos
      fetchData();
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Error al cargar el archivo.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <>
      <Navigation />
      <Container>
        <h2 className="mb-4">Panel de Control</h2>
        
        {/* Upload Section */}
        <Card className="mb-4 card-shadow border-0">
          <Card.Body>
            <h5 className="mb-3 d-flex align-items-center"><Upload className="me-2"/> Cargar Datos (CSV/Excel)</h5>
            {message.text && <Alert variant={message.type}>{message.text}</Alert>}
            <Form onSubmit={handleUpload} className="d-flex align-items-end gap-3">
              <Form.Group flex="1" className="flex-grow-1">
                <Form.Label htmlFor="formFile">Selecciona el archivo con los registros</Form.Label>
                <Form.Control type="file" id="formFile" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={uploading || !file}>
                {uploading ? <Spinner animation="border" size="sm" /> : 'Procesar Archivo'}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {loadingData ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando indicadores...</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <Row className="mb-4">
              <Col md={4} className="mb-3 mb-md-0">
                <Card className="card-shadow border-0 bg-primary text-white h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-uppercase mb-1 opacity-75">Ingresos Totales</h6>
                        <h3 className="mb-0">{formatCurrency(kpis.total_ingresos)}</h3>
                      </div>
                      <DollarSign size={40} className="opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3 mb-md-0">
                <Card className="card-shadow border-0 bg-success text-white h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-uppercase mb-1 opacity-75">Transacciones Totales</h6>
                        <h3 className="mb-0">{kpis.total_transacciones}</h3>
                      </div>
                      <Activity size={40} className="opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="card-shadow border-0 bg-info text-white h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-uppercase mb-1 opacity-75">Ticket Promedio</h6>
                        <h3 className="mb-0">{formatCurrency(kpis.ticket_promedio)}</h3>
                      </div>
                      <TrendingUp size={40} className="opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Charts */}
            <Row>
              <Col lg={8} className="mb-4">
                <Card className="card-shadow border-0 h-100">
                  <Card.Body>
                    <h5 className="mb-4" id="ventas-tiempo-title">Ventas en el Tiempo</h5>
                    
                    {/* Texto y tabla exclusiva para lectores de pantalla */}
                    <div className="visually-hidden">
                      <p>Representación visual de gráfico de líneas para Ventas en el Tiempo. A continuación se presenta una tabla con los mismos datos detallados para su lectura.</p>
                      <table aria-labelledby="ventas-tiempo-title">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Total de Ventas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesOverTime.map((item, i) => (
                            <tr key={i}>
                              <td>{item.date}</td>
                              <td>{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Contenedor del gráfico oculto para lectores de pantalla */}
                    <div style={{ height: '300px' }} aria-hidden="true">
                      {salesOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesOverTime}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="d-flex h-100 justify-content-center align-items-center text-muted">
                          No hay datos disponibles
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4} className="mb-4">
                <Card className="card-shadow border-0 h-100">
                  <Card.Body>
                    <h5 className="mb-4" id="ventas-categoria-title">Ventas por Categoría</h5>
                    
                    {/* Texto y tabla exclusiva para lectores de pantalla */}
                    <div className="visually-hidden">
                      <p>Representación visual de gráfico circular para Ventas por Categoría. A continuación se presenta una tabla con los mismos datos detallados para su lectura.</p>
                      <table aria-labelledby="ventas-categoria-title">
                        <thead>
                          <tr>
                            <th>Categoría</th>
                            <th>Total de Ventas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesByCategory.map((item, i) => (
                            <tr key={i}>
                              <td>{item.name}</td>
                              <td>{formatCurrency(item.value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Contenedor del gráfico oculto para lectores de pantalla */}
                    <div style={{ height: '300px' }} aria-hidden="true">
                      {salesByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={salesByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {salesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="d-flex h-100 justify-content-center align-items-center text-muted">
                          No hay datos disponibles
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default Dashboard;
