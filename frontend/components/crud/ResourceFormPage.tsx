'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ArrowLeft, Save, Trash2, X } from 'lucide-react';
import { apiFetch, primeCsrf, fetchMe, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import AppShell from '@/components/AppShell';
import AsyncCombobox from '@/components/AsyncCombobox';
import AsyncMultiCombobox from '@/components/AsyncMultiCombobox';
import DualListBox from '@/components/DualListBox';
import {
  Button,
  Card,
  Checkbox,
  ErrorText,
  Field,
  FieldError,
  PageContainer,
  Select,
  Spinner,
  fileInputClass,
  inputClass,
} from '@/lib/ui';
import { cn } from '@/lib/cn';

export type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'checkbox' | 'select' | 'async-fk' | 'async-fk-multi' | 'dual-list' | 'json-tags' | 'email' | 'password' | 'file';
  required?: boolean;
  choices?: string[][];
  fkApiPath?: string;
  fkLabel?: (item: any) => string;
  helpText?: string;
  dualListAvailableTitle?: string;
  dualListChosenTitle?: string;
  dualListAvailableHint?: string;
  dualListChosenHint?: string;
};

type Props = {
  apiPath: string; // com barra final, ex: '/api/taxonomia/paises/'
  id?: number | string; // ausente => criação
  title: string;
  fields: FieldConfig[];
  listHref: string;
  defaultValues?: Record<string, any>;
  wide?: boolean;
};

// Form genérico (create + edit + delete) reusado pelas telas CRUD
// mecanicamente similares. Um FieldConfig[] descreve os campos; o resto
// (auth guard, load, save, erros por campo, exclusão) é comum a todas.
export default function ResourceFormPage({ apiPath, id, title, fields, listHref, defaultValues, wide }: Props) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(defaultValues || {});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(id != null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchMe().then((me) => {
      if (!me) {
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
    });
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    primeCsrf();
    if (id != null) {
      apiFetch<any>(`${apiPath}${id}/`).then((data) => {
        setForm(data);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, id, apiPath]);

  function set(name: string, value: any) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const hasFile = Object.values(files).some((f) => f != null);
      let body: FormData | string;
      if (hasFile) {
        const fd = new FormData();
        for (const f of fields) {
          if (f.type === 'file') continue;
          const value = form[f.name];
          if (value === null || value === undefined) continue;
          if (f.type === 'password' && id != null && !value) continue;
          if (Array.isArray(value)) {
            for (const v of value) fd.append(f.name, String(v));
            continue;
          }
          fd.append(f.name, typeof value === 'boolean' ? String(value) : value);
        }
        for (const [name, file] of Object.entries(files)) {
          if (file) fd.append(name, file);
        }
        body = fd;
      } else {
        const payload = { ...form };
        if (id != null && 'password' in payload && !payload.password) delete payload.password;
        body = JSON.stringify(payload);
      }

      if (id != null) {
        await apiFetch(`${apiPath}${id}/`, { method: 'PATCH', body });
        toast.success('Alterações salvas');
      } else {
        await apiFetch(`${apiPath}`, { method: 'POST', body });
        toast.success('Registro criado com sucesso');
      }
      router.push(listHref);
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === 'object') {
        const body = err.body as Record<string, unknown>;
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(body)) {
          flat[k] = Array.isArray(v) ? v.join(' ') : String(v);
        }
        setFieldErrors(flat);
      }
      const message = err instanceof Error ? err.message : 'Erro ao salvar.';
      setError(message);
      toast.error('Erro ao salvar', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (id == null) return;
    setSaving(true);
    try {
      await apiFetch(`${apiPath}${id}/`, { method: 'DELETE' });
      toast.success('Registro excluído');
      router.push(listHref);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir.';
      setError(message);
      toast.error('Erro ao excluir', message);
      setSaving(false);
    }
  }

  if (!authChecked || loading) return null;

  return (
    <AppShell title={title}>
      <PageContainer wide={wide}>
        <Link href={listHref} className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Voltar
        </Link>
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">{title}</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <ErrorText>{error}</ErrorText>
            {fields.map((f) => (
              <Field key={f.name} label={f.label} hint={f.type !== 'password' ? f.helpText : undefined}>
                {renderInput(f, form, set, files, setFiles)}
                <FieldError>{fieldErrors[f.name]}</FieldError>
              </Field>
            ))}
            <div className="mt-2 flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner className="text-white" /> : <Save className="h-4 w-4" strokeWidth={1.75} />}
                Salvar
              </Button>
              {id != null && (
                <AlertDialog.Root open={confirmDelete} onOpenChange={setConfirmDelete}>
                  <AlertDialog.Trigger asChild>
                    <Button type="button" variant="danger" disabled={saving}>
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      Excluir
                    </Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 z-40 bg-stone-900/40 dark:bg-black/60" />
                    <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-popover dark:bg-stone-900">
                      <AlertDialog.Title className="text-base font-semibold text-stone-900 dark:text-stone-100">Confirmar exclusão</AlertDialog.Title>
                      <AlertDialog.Description className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                        Esta ação não pode ser desfeita. O registro será excluído permanentemente.
                      </AlertDialog.Description>
                      <div className="mt-6 flex justify-end gap-3">
                        <AlertDialog.Cancel asChild>
                          <Button type="button" variant="secondary">
                            Cancelar
                          </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <Button type="button" variant="danger" onClick={handleDelete}>
                            Excluir
                          </Button>
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              )}
            </div>
          </form>
        </Card>
      </PageContainer>
    </AppShell>
  );
}

function renderInput(
  f: FieldConfig,
  form: Record<string, any>,
  set: (name: string, value: any) => void,
  files: Record<string, File | null>,
  setFiles: React.Dispatch<React.SetStateAction<Record<string, File | null>>>,
) {
  const value = form[f.name];
  switch (f.type) {
    case 'select':
      return <Select value={value ?? ''} onChange={(v) => set(f.name, v)} choices={f.choices || []} required={f.required} />;
    case 'async-fk':
      return (
        <AsyncCombobox
          apiPath={f.fkApiPath!}
          value={value ?? null}
          onChange={(v) => set(f.name, v)}
          getLabel={f.fkLabel!}
          required={f.required}
        />
      );
    case 'async-fk-multi':
      return (
        <AsyncMultiCombobox
          apiPath={f.fkApiPath!}
          value={value ?? []}
          onChange={(v) => set(f.name, v)}
          getLabel={f.fkLabel!}
        />
      );
    case 'dual-list':
      return (
        <DualListBox
          apiPath={f.fkApiPath!}
          value={value ?? []}
          onChange={(v) => set(f.name, v)}
          getLabel={f.fkLabel!}
          availableTitle={f.dualListAvailableTitle}
          chosenTitle={f.dualListChosenTitle}
          availableHint={f.dualListAvailableHint}
          chosenHint={f.dualListChosenHint}
        />
      );
    case 'json-tags':
      return <JsonTagsInput value={Array.isArray(value) ? value : []} onChange={(v) => set(f.name, v)} choices={f.choices || []} />;
    case 'checkbox':
      return <Checkbox checked={!!value} onChange={(v) => set(f.name, v)} />;
    case 'textarea':
      return (
        <textarea
          className={cn(inputClass, 'min-h-[88px]')}
          value={value ?? ''}
          onChange={(e) => set(f.name, e.target.value)}
          required={f.required}
        />
      );
    case 'number':
      return (
        <input
          className={inputClass}
          type="number"
          value={value ?? ''}
          onChange={(e) => set(f.name, e.target.value === '' ? null : Number(e.target.value))}
          required={f.required}
        />
      );
    case 'date':
      return (
        <input
          className={inputClass}
          type="date"
          value={value ?? ''}
          onChange={(e) => set(f.name, e.target.value)}
          required={f.required}
        />
      );
    case 'password':
      return (
        <input
          className={inputClass}
          type="password"
          value={value ?? ''}
          onChange={(e) => set(f.name, e.target.value)}
          placeholder={f.helpText}
        />
      );
    case 'email':
      return (
        <input
          className={inputClass}
          type="email"
          value={value ?? ''}
          onChange={(e) => set(f.name, e.target.value)}
          required={f.required}
        />
      );
    case 'file':
      return (
        <>
          {typeof value === 'string' && value && (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="mb-1.5 block text-sm text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
            >
              Arquivo atual
            </a>
          )}
          <input
            className={fileInputClass}
            type="file"
            onChange={(e) => setFiles((prev) => ({ ...prev, [f.name]: e.target.files?.[0] || null }))}
          />
        </>
      );
    default:
      return (
        <input
          className={inputClass}
          type="text"
          value={value ?? ''}
          onChange={(e) => set(f.name, e.target.value)}
          required={f.required}
        />
      );
  }
}

// Editor de campo JSONField que guarda uma lista de strings (ex.:
// VeiculoLancador.propelente) — chips rápidos a partir de `choices` +
// campo livre para valores fora da lista sugerida.
function JsonTagsInput({ value, onChange, choices }: { value: string[]; onChange: (v: string[]) => void; choices: string[][] }) {
  const [custom, setCustom] = useState('');

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  function addCustom() {
    const v = custom.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setCustom('');
  }

  const extras = value.filter((v) => !choices.some(([cv]) => cv === v));

  return (
    <div>
      {choices.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {choices.map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => toggle(v)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                value.includes(v)
                  ? 'border-accent-300 bg-accent-50 text-accent-800 dark:border-accent-800 dark:bg-accent-900/30 dark:text-accent-300'
                  : 'border-stone-200 text-stone-500 hover:border-stone-300 dark:border-stone-700 dark:text-stone-400',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {extras.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {extras.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300"
            >
              {v}
              <button type="button" onClick={() => toggle(v)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-100">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className={inputClass}
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Outro propelente…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={addCustom}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}
