import React, { useState } from 'react';
import { Upload, Send, Paperclip } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    lastname: '',
    id: '',
    email: '',
    phone: '',
    address: '',
    subject: '',
    message: ''
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', { ...formData, document: documentFile });
      setIsSubmitting(false);
      // Reset form
      setFormData({
        username: '',
        lastname: '',
        id: '',
        email: '',
        phone: '',
        address: '',
        subject: '',
        message: ''
      });
      setDocumentFile(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-navy uppercase mb-4">
            Atención a la Población
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Nos esforzamos por brindar un servicio de calidad y cercanía a todos los usuarios.
            Nos comprometemos a escuchar sus necesidades, preocupaciones y para poder ofrecerles
            la mejor atención posible.
          </p>
          <p className="text-primary-navy font-medium mt-2">
            Complete la información siguiente para realizar la consulta.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-primary-navy/25 p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Fields */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nombres:
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-lime focus:border-transparent outline-none transition-colors"
                placeholder="Ingrese sus nombres"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                Apellidos:
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-lime focus:border-transparent outline-none transition-colors"
                placeholder="Ingrese sus apellidos"
                required
              />
            </div>

            {/* ID and Email */}
            <div className="space-y-2">
              <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                Carnet de Identidad:
              </label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-lime focus:border-transparent outline-none transition-colors"
                placeholder="Ingrese su número de carnet"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-lime focus:border-transparent outline-none transition-colors"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            {/* Phone and Address */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Teléfono:
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-lime focus:border-transparent outline-none transition-colors"
                placeholder="+53 (24) XXXXXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Dirección:
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-lime focus:border-transparent outline-none transition-colors"
                placeholder="Calle, número, municipio"
                required
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Paperclip size={16} className="text-secondary-lime" />
              Documento (PDF):
            </label>
            <div className="border-2 border-dashed border-primary-navy/25 rounded-lg p-6 text-center hover:border-secondary-lime/50 transition-colors">
              <input
                type="file"
                id="document"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="document"
                className="cursor-pointer flex flex-col items-center gap-2 text-primary-navy hover:text-secondary-lime transition-colors"
              >
                <Upload size={24} />
                <span className="text-sm font-medium">
                  {documentFile ? documentFile.name : 'Adjuntar documento'}
                </span>
              </label>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción:
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-lime focus:border-transparent outline-none transition-colors resize-none"
              placeholder="Describa brevemente su solicitud o el problema que presenta"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-primary-navy text-white font-bold rounded-lg hover:bg-secondary-lime transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent border-r-transparent animate-spin rounded-full"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Enviar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
