// src/app/dashboard/support/page.tsx
"use client";

import React, { useState } from "react";
import { Paper, Typography, TextField, Button, Stack } from "@mui/material";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // (no-op) you could hook up your mass-mail logic here
    alert(`Sending:\nSubject: ${subject}\n\n${body}`);
  };

  return (
    <section className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Typography variant="h4">Support</Typography>
      </div>

      {/* Form container */}
      <Paper
        elevation={2}
        sx={{ p: 4, borderRadius: 2 }}
        className="min-w-full"
      >
        <form onSubmit={handleSend}>
          <Stack spacing={3}>
            <TextField
              label="Email Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
            />
            <TextField
              label="Message Body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              fullWidth
              multiline
              rows={8}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Send to All Members
            </Button>
          </Stack>
        </form>
      </Paper>
    </section>
  );
}
