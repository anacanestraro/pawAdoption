/**
 * DenunciaModal.tsx — PawAdoption
 *
 * Modal de denúncia de anúncio (RF13), usado no feed de animais e na tela do animal.
 * Endpoint: POST /denuncias/denunciar/:animalId → { motivo }
 *
 * O próprio modal envia a denúncia; a página só decide o que fazer depois (ex.: toast).
 */

import { useState } from 'react'
import api from '../api/api'

const MOTIVO_MAX = 500

const MOTIVOS_RAPIDOS = [
  'Anúncio falso ou golpe',
  'Venda do animal',
  'Suspeita de maus-tratos',
  'Informações enganosas',
]

interface Props {
  animal:    { id: number; nome: string }
  onClose:   () => void
  onSucesso: () => void
}

export const DenunciaModal = ({ animal, onClose, onSucesso }: Props) => {
  const [motivo,   setMotivo]   = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro,     setErro]     = useState('')

  const podeEnviar = motivo.trim().length > 0 && !enviando

  const enviar = async () => {
    if (!podeEnviar) return
    setEnviando(true)
    setErro('')
    try {
      await api.post(`/denuncias/denunciar/${animal.id}`, { motivo: motivo.trim() })
      onSucesso()
    } catch (e: any) {
      setErro(e?.response?.data?.error || 'Erro ao enviar denúncia. Tente novamente.')
      setEnviando(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget && !enviando) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="denuncia-titulo"
        style={{
          background: 'var(--paper)', borderRadius: 20,
          padding: '26px 24px', width: '100%', maxWidth: 440,
          maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        {/* Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: '#FFF5F5', border: '1.5px solid #f5c2c7', color: '#842029',
            display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 800,
          }}>
            ⚑
          </div>
          <div style={{ minWidth: 0 }}>
            <div id="denuncia-titulo" style={{
              fontFamily: "'Baloo 2', system-ui", fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)',
            }}>
              Denunciar anúncio
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>{animal.nome}</div>
          </div>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--ink-2)', margin: 0, lineHeight: 1.55 }}>
          Conte o que há de errado com este anúncio. Um administrador vai revisar.
        </p>

        {/* Motivos rápidos */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {MOTIVOS_RAPIDOS.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMotivo(m)}
              style={{
                padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 700,
                border: `1.5px solid ${motivo === m ? '#f5c2c7' : 'var(--line-2)'}`,
                background: motivo === m ? '#FFF5F5' : 'transparent',
                color: motivo === m ? '#842029' : 'var(--ink-2)',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Motivo livre */}
        <div>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Descreva o motivo da denúncia…"
            rows={4}
            maxLength={MOTIVO_MAX}
            aria-label="Motivo da denúncia"
            style={{
              width: '100%', padding: '10px 13px',
              borderRadius: 11, border: '1.5px solid var(--line-2)',
              background: 'var(--cream)', color: 'var(--ink)',
              fontFamily: "'Nunito', system-ui", fontSize: '0.88rem', fontWeight: 600,
              outline: 'none', resize: 'vertical', lineHeight: 1.55,
            }}
          />
          <div style={{ textAlign: 'right', fontSize: '0.74rem', color: 'var(--ink-3)', marginTop: 2 }}>
            {motivo.length}/{MOTIVO_MAX}
          </div>
        </div>

        {erro && (
          <div role="alert" style={{
            background: '#FFF5F5', border: '1.5px solid #f5c2c7',
            borderRadius: 10, padding: '10px 13px',
            fontSize: '0.82rem', fontWeight: 700, color: '#842029',
          }}>
            ⚠️ {erro}
          </div>
        )}

        {/* Botões */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            style={{
              padding: '9px 20px', borderRadius: 10,
              border: '1.5px solid var(--line-2)', background: 'transparent', color: 'var(--ink-2)',
              fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={enviar}
            disabled={!podeEnviar}
            style={{
              padding: '9px 22px', borderRadius: 10, border: 'none',
              background: '#842029', color: '#fff',
              fontSize: '0.88rem', fontWeight: 800,
              cursor: podeEnviar ? 'pointer' : 'not-allowed',
              opacity: podeEnviar ? 1 : 0.55, minWidth: 140,
            }}
          >
            {enviando ? 'Enviando…' : 'Enviar denúncia'}
          </button>
        </div>
      </div>
    </div>
  )
}