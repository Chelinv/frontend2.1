import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
const API_URL = "https://backend-hpfp54r8s-chelinvs-projects.vercel.app/api/modelos";


const App = () => {
  const [modelos, setModelos] = useState([]);
  const [formData, setFormData] = useState({
    tipo: "A",  // Valor predeterminado A
    talla: "30", // Valor predeterminado 30
    costoTela: "",
    cantidad: ""
  });

  useEffect(() => {
    fetchModelos();
  }, []);

  const fetchModelos = async () => {
    try {
      const response = await axios.get(API_URL);
      setModelos(response.data);
    } catch (error) {
      console.error("Error al obtener modelos:", error.response?.data || error.message);
    }
  };
  

  const calcularPrecioVenta = (tipo, talla, costoTela, cantidad) => {
    let metrosTela = tipo === "A" ? 1.5 : 1.8;
    let porcentajeManoObra = tipo === "A" ? 0.80 : 0.95;

    let costoTelaTotal = metrosTela * costoTela;
    let costoManoObra = costoTelaTotal * porcentajeManoObra;
    let costoTotal = costoTelaTotal + costoManoObra;

    if (talla === "32" || talla === "36") {
      costoTotal *= 1.04; // Aumento del 4%
    }

    let precioVenta = costoTotal * 1.30; // Aumento del 30%
    let gananciaTotal = (precioVenta - costoTotal) * cantidad;

    return { precioVenta, gananciaTotal };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { precioVenta, gananciaTotal } = calcularPrecioVenta(
      formData.tipo,
      formData.talla,
      parseFloat(formData.costoTela),
      parseInt(formData.cantidad)
    );
  
    try {
      await axios.post(API_URL, { ...formData, precioVenta, ganancia: gananciaTotal });
      fetchModelos();
    } catch (error) {
      console.error("Error al agregar modelo:", error.response?.data || error.message);
    }
  };

  return (
    <div className="container">
      <h1>Gestión de Modelos</h1>
      <form onSubmit={handleSubmit}>
        {/* Combo Box para seleccionar el tipo de modelo */}
        <label>Tipo de Modelo:</label>
        <select name="tipo" value={formData.tipo} onChange={handleChange} required>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>

        {/* Combo Box para seleccionar la talla */}
        <label>Talla:</label>
        <select name="talla" value={formData.talla} onChange={handleChange} required>
          <option value="30">30</option>
          <option value="32">32</option>
          <option value="36">36</option>
        </select>

        <input type="number" name="costoTela" value={formData.costoTela} onChange={handleChange} placeholder="Costo Tela" required />
        <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} placeholder="Cantidad" required />
        <button type="submit">Agregar Modelo</button>
      </form>
      <ul>
        {modelos.map((modelo) => {
          const { precioVenta } = calcularPrecioVenta(modelo.tipo, modelo.talla, modelo.costoTela, modelo.cantidad);
          return (
            <li key={modelo._id}>
              <span>{modelo.tipo} - {modelo.talla} - ${precioVenta.toFixed(2)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default App;