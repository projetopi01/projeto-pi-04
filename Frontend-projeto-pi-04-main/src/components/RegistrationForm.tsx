return (
    <section className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-100">
        <SectionTitle title="Cadastro de Gestantes" />
        
        <form className="space-y-8">
            {/* GRUPO 1: IDENTIFICAÇÃO */}
            <div>
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2">
                    1. Identificação da Paciente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fieldOrder.slice(0, 5).map((key) => (
                        <div key={key} className="flex flex-col">
                            <label htmlFor={key} className="mb-1 text-sm font-semibold text-gray-600">{labels[key]}</label>
                            <input
                                type={dateFields.includes(key) ? 'date' : 'text'}
                                id={key}
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                readOnly={key === 'idade'}
                                className={`p-2.5 border border-gray-200 rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${key === 'idade' ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* GRUPO 2: DADOS GESTACIONAIS (IMPORTANTE PARA FERRAZ) */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-sm font-bold text-[#1a5276] uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">
                    2. Informações do Pré-Natal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fieldOrder.slice(5, 7).map((key) => (
                        <div key={key} className="flex flex-col">
                            <label htmlFor={key} className="mb-1 text-sm font-bold text-[#1a5276]">{labels[key]}</label>
                            <input
                                type="date"
                                id={key}
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                className="p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* GRUPO 3: ENDEREÇO E CONTATO */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
                    3. Localização e Contato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fieldOrder.slice(7).map((key) => (
                        <div key={key} className="flex flex-col">
                            <label htmlFor={key} className="mb-1 text-sm font-semibold text-gray-600">{labels[key]}</label>
                            <input
                                type="text"
                                id={key}
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                onBlur={key === 'cep' ? handleCepSearch : undefined}
                                className="p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </form>
    </section>
);
