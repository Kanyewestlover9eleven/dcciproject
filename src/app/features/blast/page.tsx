// src/features/blast/page.tsx  (or wherever you placed it)
"use client";

import { useMemo, useState } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormControlLabel, Checkbox, Paper, Tab, Tabs, TextField,
  Typography, Divider, Snackbar, Alert, CircularProgress, MenuItem, Select, InputLabel
} from "@mui/material";
import Grid from "@mui/material/Grid"; // <-- Grid v2
import { DataGrid } from "@mui/x-data-grid"; 
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TagInput from "./components/tagInput";

type Filters = {
  status?: string[];
  gender?: string[];
  region?: string[];
  industryType?: string[];
  ageMin?: string;
  ageMax?: string;
};

type AudienceRow = { id: number; name: string; filters: any; updatedAt: string };
type TemplateRow = { id: number; name: string; subject: string; emailBody: string; waBody: string; updatedAt: string };

type PreviewResp = {
  data: {
    total: number;
    withEmail: number;
    withWhatsApp: number;
    sample: { id: number; name?: string; email?: string; phone?: string }[];
  };
};

export default function BlastFeaturePage() {
  const qc = useQueryClient();

  // Tabs
  const [tab, setTab] = useState(0);

  // Filters
  const [status, setStatus]     = useState<string[]>([]);
  const [gender, setGender]     = useState<string[]>([]);
  const [region, setRegion]     = useState<string[]>([]);
  const [industry, setIndustry] = useState<string[]>([]);
  const [ageMin, setAgeMin]     = useState<string>("");
  const [ageMax, setAgeMax]     = useState<string>("");

  const filters: Filters = useMemo(() => ({
    status, gender, region, industryType: industry,
    ageMin: ageMin || undefined,
    ageMax: ageMax || undefined,
  }), [status, gender, region, industry, ageMin, ageMax]);

  // Saved audiences/templates
  const audQ = useQuery({
    queryKey: ["audiences"],
    queryFn: async () => {
      const r = await fetch("/api/blast/audiences");
      if (!r.ok) throw new Error("Failed to load audiences");
      const j = await r.json();
      return j.data as AudienceRow[];
    },
  });

  const tplQ = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const r = await fetch("/api/blast/templates");
      if (!r.ok) throw new Error("Failed to load templates");
      const j = await r.json();
      return j.data as TemplateRow[];
    },
  });

  const [selectedAudienceId, setSelectedAudienceId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const applyAudience = (a: AudienceRow) => {
    const f = a.filters || {};
    setStatus(f.status ?? []);
    setGender(f.gender ?? []);
    setRegion(f.region ?? []);
    setIndustry(f.industryType ?? []);
    setAgeMin(f.ageMin != null ? String(f.ageMin) : "");
    setAgeMax(f.ageMax != null ? String(f.ageMax) : "");
  };

  const [sendEmail, setSendEmail]   = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [subject, setSubject]       = useState("");
  const [emailBody, setEmailBody]   = useState("Hi {name},\n\n");
  const [waBody, setWaBody]         = useState("Hi {name}, ");

  const applyTemplate = (t: TemplateRow) => {
    setSubject(t.subject || "");
    setEmailBody(t.emailBody || "");
    setWaBody(t.waBody || "");
  };

  // Mutations
  const saveAudience = useMutation({
    mutationFn: async (payload: { name: string; filters: any }) => {
      const r = await fetch("/api/blast/audiences", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audiences"] }),
  });

  const deleteAudience = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/blast/audiences/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audiences"] }),
  });

  const saveTemplate = useMutation({
    mutationFn: async (payload: { name: string; subject: string; emailBody: string; waBody: string }) => {
      const r = await fetch("/api/blast/templates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/blast/templates/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });

  const preview = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/blast/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json() as Promise<PreviewResp>;
    },
  });

  const send = useMutation({
    mutationFn: async () => {
      if (!sendEmail && !sendWhatsApp) throw new Error("Pick at least one channel.");
      if (sendEmail && !subject.trim()) throw new Error("Email subject is required.");
      const r = await fetch("/api/blast/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audienceId: selectedAudienceId ?? undefined,
          templateId: selectedTemplateId ?? undefined,
          channels: { email: sendEmail, whatsapp: sendWhatsApp },
          filters, subject, emailBody, waBody,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json() as Promise<{ ok: true; total: number; batches: number; jobId: number }>;
    },
  });

  // Save dialogs / Toast
  const [saveAudienceOpen, setSaveAudienceOpen] = useState(false);
  const [saveAudienceName, setSaveAudienceName] = useState("");
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const ok  = (m: string) => setToast({ type: "success", msg: m });
  const err = (m: string) => setToast({ type: "error", msg: m });

  return (
    <Box className="space-y-4">
      <Typography variant="h4">Blast (Email / WhatsApp)</Typography>

      <Paper className="p-0">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary">
          <Tab label="1. Audience" />
          <Tab label="2. Content" />
          <Tab label="3. Review & Send" />
        </Tabs>
        <Divider />
        <Box className="p-6">
          {/* Tab 1: Audience */}
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TagInput label="Status (comma)" value={status} onChange={setStatus} placeholder="ACTIVE, INACTIVE, DECEASED" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TagInput label="Gender (comma)" value={gender} onChange={setGender} placeholder="M, F" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TagInput label="Region (comma)" value={region} onChange={setRegion} placeholder="Kuching, Miri" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TagInput label="Industry (comma)" value={industry} onChange={setIndustry} placeholder="Construction, Oil & Gas" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField label="Age ≥" type="number" fullWidth value={ageMin} onChange={(e)=>setAgeMin(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField label="Age ≤" type="number" fullWidth value={ageMax} onChange={(e)=>setAgeMax(e.target.value)} />
                  </Grid>
                </Grid>

                <Box className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outlined" onClick={() => { setSaveAudienceName(""); setSaveAudienceOpen(true); }}>
                    Save Audience
                  </Button>

                  <FormControl size="small" sx={{ minWidth: 240 }}>
                    <InputLabel id="aud-select">Load Audience</InputLabel>
                    <Select
                      labelId="aud-select" label="Load Audience"
                      value={selectedAudienceId ?? ""}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setSelectedAudienceId(Number.isNaN(id) ? null : id);
                        const row = audQ.data?.find(a => a.id === id);
                        if (row) { applyAudience(row); ok(`Loaded audience: ${row.name}`); }
                      }}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {(audQ.data || []).map(a => (
                        <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedAudienceId && (
                    <Button
                      color="error" variant="outlined"
                      onClick={() => {
                        const id = selectedAudienceId!;
                        deleteAudience.mutate(id, {
                          onSuccess: () => { setSelectedAudienceId(null); ok("Audience deleted"); },
                          onError: (e: any) => err(String(e.message || e)),
                        });
                      }}
                    >
                      Delete Audience
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    onClick={() => preview.mutate(undefined, {
                      onSuccess: () => ok("Preview updated"),
                      onError: (e: any) => err(String(e.message || e)),
                    })}
                    disabled={preview.isPending}
                    startIcon={preview.isPending ? <CircularProgress size={18}/> : undefined}
                  >
                    {preview.isPending ? "Previewing…" : "Preview"}
                  </Button>

                  <Button onClick={() => setTab(1)}>Next</Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1">Saved Audiences</Typography>
                <div className="mt-2 space-y-1">
                  {audQ.isLoading && <Typography variant="body2">Loading…</Typography>}
                  {!audQ.isLoading && (audQ.data?.length ?? 0) === 0 && (
                    <Typography variant="body2" color="text.secondary">No saved audiences yet.</Typography>
                  )}
                  {(audQ.data || []).map((a) => (
                    <div key={a.id} className="flex items-center gap-8 justify-between">
                      <div className="flex items-center gap-2">
                        <Chip label={a.name} variant={selectedAudienceId === a.id ? "filled" : "outlined"} />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(a.updatedAt).toLocaleString()}
                        </Typography>
                      </div>
                      <div className="flex gap-1">
                        <Button size="small" onClick={() => { setSelectedAudienceId(a.id); applyAudience(a); ok(`Loaded audience: ${a.name}`); }}>
                          Load
                        </Button>
                        <Button size="small" color="error" onClick={()=>{
                          deleteAudience.mutate(a.id, {
                            onSuccess: () => { if (selectedAudienceId === a.id) setSelectedAudienceId(null); ok("Audience deleted"); },
                            onError: (e:any)=>err(String(e.message || e)),
                          });
                        }}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Grid>

              {/* Preview table */}
              <Grid size={{ xs: 12}}>
                {preview.data?.data && (
                  <Paper className="p-4">
                    <Typography variant="subtitle2" gutterBottom>Preview Summary</Typography>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span>Total matched: <b>{preview.data.data.total}</b></span>
                      <span>With Email: <b>{preview.data.data.withEmail}</b></span>
                      <span>With WhatsApp: <b>{preview.data.data.withWhatsApp}</b></span>
                    </div>
                    <div className="mt-3" style={{ height: 240 }}>
                      <DataGrid
                        rows={preview.data.data.sample}
                        columns={[
                          { field: "id", headerName: "ID", width: 80 },
                          { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
                          { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
                          { field: "phone", headerName: "Phone", flex: 1, minWidth: 140 },
                        ]}
                        getRowId={(r)=>r.id}
                        hideFooter
                      />
                    </div>
                    <Button
                      size="small"
                      className="mt-2"
                      variant="outlined"
                      onClick={() => preview.mutate(undefined, {
                        onSuccess: () => ok("Preview updated"),
                        onError: (e:any) => err(String(e.message || e)),
                      })}
                    >
                      Refresh Preview
                    </Button>
                  </Paper>
                )}
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Content */}
          {tab === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <div className="flex gap-6">
                  <FormControlLabel control={<Checkbox checked={sendEmail} onChange={(e)=>setSendEmail(e.target.checked)} />} label="Email" />
                  <FormControlLabel control={<Checkbox checked={sendWhatsApp} onChange={(e)=>setSendWhatsApp(e.target.checked)} />} label="WhatsApp" />
                </div>

                {sendEmail && (
                  <Box className="space-y-3 mt-2">
                    <TextField label="Email Subject" fullWidth value={subject} onChange={(e)=>setSubject(e.target.value)} />
                    <TextField
                      label="Email Body (supports {name})"
                      fullWidth multiline minRows={6}
                      value={emailBody} onChange={(e)=>setEmailBody(e.target.value)}
                    />
                  </Box>
                )}

                {sendWhatsApp && (
                  <Box className="space-y-3 mt-4">
                    <TextField
                      label="WhatsApp Text (supports {name})"
                      fullWidth multiline minRows={4}
                      value={waBody} onChange={(e)=>setWaBody(e.target.value)}
                    />
                  </Box>
                )}

                <Box className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outlined" onClick={() => { setSaveTemplateName(""); setSaveTemplateOpen(true); }}>
                    Save Template
                  </Button>

                  <FormControl size="small" sx={{ minWidth: 240 }}>
                    <InputLabel id="tpl-select">Load Template</InputLabel>
                    <Select
                      labelId="tpl-select" label="Load Template"
                      value={selectedTemplateId ?? ""}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setSelectedTemplateId(Number.isNaN(id) ? null : id);
                        const row = tplQ.data?.find(t => t.id === id);
                        if (row) { applyTemplate(row); ok(`Loaded template: ${row.name}`); }
                      }}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {(tplQ.data || []).map(t => (
                        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedTemplateId && (
                    <Button
                      color="error" variant="outlined"
                      onClick={() => {
                        const id = selectedTemplateId!;
                        deleteTemplate.mutate(id, {
                          onSuccess: () => { setSelectedTemplateId(null); ok("Template deleted"); },
                          onError: (e:any) => err(String(e.message || e)),
                        });
                      }}
                    >
                      Delete Template
                    </Button>
                  )}

                  <Button onClick={() => setTab(2)}>Next</Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle1">Saved Templates</Typography>
                <div className="mt-2 space-y-1">
                  {tplQ.isLoading && <Typography variant="body2">Loading…</Typography>}
                  {!tplQ.isLoading && (tplQ.data?.length ?? 0) === 0 && (
                    <Typography variant="body2" color="text.secondary">No templates yet.</Typography>
                  )}
                  {(tplQ.data || []).map((t) => (
                    <div key={t.id} className="flex items-center gap-8 justify-between">
                      <div className="flex items-center gap-2">
                        <Chip label={t.name} variant={selectedTemplateId === t.id ? "filled" : "outlined"} />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(t.updatedAt).toLocaleString()}
                        </Typography>
                      </div>
                      <div className="flex gap-1">
                        <Button size="small" onClick={() => { setSelectedTemplateId(t.id); applyTemplate(t); ok(`Loaded template: ${t.name}`); }}>
                          Load
                        </Button>
                        <Button size="small" color="error" onClick={()=>{
                          deleteTemplate.mutate(t.id, {
                            onSuccess: () => { if (selectedTemplateId === t.id) setSelectedTemplateId(null); ok("Template deleted"); },
                            onError: (e:any)=>err(String(e.message || e)),
                          });
                        }}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Divider className="my-4" />
                <Typography variant="subtitle2">Placeholders</Typography>
                <div className="text-sm text-gray-500">
                  Use <code>{"{name}"}</code> inside message bodies.
                </div>
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Review & Send */}
          {tab === 2 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper className="p-4 space-y-2">
                  <Typography variant="h6">Review</Typography>
                  <div className="text-sm space-y-1">
                    <div>Channels: <b>{[
                      sendEmail ? "Email" : null,
                      sendWhatsApp ? "WhatsApp" : null,
                    ].filter(Boolean).join(", ") || "None"}</b></div>
                    {selectedAudienceId && <div>Audience: <b>#{selectedAudienceId}</b></div>}
                    {selectedTemplateId && <div>Template: <b>#{selectedTemplateId}</b></div>}
                    {sendEmail && <>
                      <div>Email Subject: <b>{subject || "(empty)"}</b></div>
                      <div>Email Body:</div>
                      <pre className="bg-gray-100 p-2 rounded overflow-auto">{emailBody || "(empty)"}</pre>
                    </>}
                    {sendWhatsApp && <>
                      <div>WhatsApp Body:</div>
                      <pre className="bg-gray-100 p-2 rounded overflow-auto">{waBody || "(empty)"}</pre>
                    </>}
                  </div>
                </Paper>

                <Box className="mt-4 flex gap-2">
                  <Button onClick={() => setTab(1)}>Back</Button>
                  <Button
                    variant="contained"
                    onClick={() => send.mutate(undefined, {
                      onSuccess: (r) => ok(`Queued to n8n: ${r.total} recipients (job #${r.jobId}).`),
                      onError: (e:any) => err(String(e.message || e)),
                    })}
                    disabled={send.isPending}
                    startIcon={send.isPending ? <CircularProgress size={18}/> : undefined}
                  >
                    {send.isPending ? "Sending…" : "Send to n8n"}
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Paper className="p-4">
                  <Typography variant="subtitle1" gutterBottom>Latest Preview</Typography>
                  {preview.data?.data ? (
                    <>
                      <div className="text-sm space-x-4">
                        <span>Total: <b>{preview.data.data.total}</b></span>
                        <span>Email-ready: <b>{preview.data.data.withEmail}</b></span>
                        <span>WhatsApp-ready: <b>{preview.data.data.withWhatsApp}</b></span>
                      </div>
                      <div className="mt-2" style={{ height: 240 }}>
                        <DataGrid
                          rows={preview.data.data.sample}
                          columns={[
                            { field: "id", headerName: "ID", width: 80 },
                            { field: "name", headerName: "Name", flex: 1, minWidth: 140 },
                            { field: "email", headerName: "Email", flex: 1, minWidth: 160 },
                            { field: "phone", headerName: "Phone", flex: 1, minWidth: 130 },
                          ]}
                          getRowId={(r)=>r.id}
                          hideFooter
                        />
                      </div>
                      <Button
                        size="small"
                        className="mt-2"
                        variant="outlined"
                        onClick={() => preview.mutate(undefined, {
                          onSuccess: () => ok("Preview updated"),
                          onError: (e:any) => err(String(e.message || e)),
                        })}
                      >
                        Refresh Preview
                      </Button>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No preview yet. Run a preview from the Audience tab.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Save Audience dialog */}
      <Dialog open={saveAudienceOpen} onClose={()=>setSaveAudienceOpen(false)}>
        <DialogTitle>Save Audience</DialogTitle>
        <DialogContent>
          <TextField
            label="Audience name"
            fullWidth autoFocus
            value={saveAudienceName}
            onChange={(e)=>setSaveAudienceName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setSaveAudienceOpen(false)}>Cancel</Button>
          <Button
            onClick={()=>{
              saveAudience.mutate(
                { name: saveAudienceName || "Untitled Audience", filters },
                {
                  onSuccess: () => { setSaveAudienceOpen(false); ok("Audience saved"); },
                  onError: (e:any) => err(String(e.message || e)),
                }
              );
            }}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Template dialog */}
      <Dialog open={saveTemplateOpen} onClose={()=>setSaveTemplateOpen(false)}>
        <DialogTitle>Save Template</DialogTitle>
        <DialogContent>
          <TextField
            label="Template name"
            fullWidth autoFocus
            value={saveTemplateName}
            onChange={(e)=>setSaveTemplateName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setSaveTemplateOpen(false)}>Cancel</Button>
          <Button
            onClick={()=>{
              saveTemplate.mutate(
                { name: saveTemplateName || "Untitled Template", subject, emailBody, waBody },
                {
                  onSuccess: () => { setSaveTemplateOpen(false); ok("Template saved"); },
                  onError: (e:any) => err(String(e.message || e)),
                }
              );
            }}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={()=>setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast && <Alert severity={toast.type} onClose={()=>setToast(null)}>{toast.msg}</Alert>}
      </Snackbar>
    </Box>
  );
}
