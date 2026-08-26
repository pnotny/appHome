/* ==========================================================================
   CrossFit Coach — export tréninku jako sdílitelná karta (Canvas → PNG)
   ========================================================================== */

window.CFShare = (function () {
  const W = 1080, H = 1350;

  const ACCENTS = {
    strength: '#FF9500', gymnastics: '#5E5CE6', monostructural: '#30B0C7',
    chipper: '#FF3B30', rest: '#34C759'
  };

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lines = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && line !== '') {
        ctx.fillText(line, x, y + lines * lineHeight);
        line = words[i] + ' ';
        lines++;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, y + lines * lineHeight);
    return lines + 1;
  }

  async function ensureFont() {
    try {
      await document.fonts.load('800 64px "Sora"');
      await document.fonts.load('600 28px "Sora"');
      await document.fonts.ready;
    } catch (e) { /* font fallback ticho */ }
  }

  async function renderShareCard(workout, profile) {
    await ensureFont();
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const accent = ACCENTS[workout.dayType] || '#0A84FF';

    // pozadí — jemný gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0B0B10');
    bg.addColorStop(1, '#17171F');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // akcentní glow v rohu
    const glow = ctx.createRadialGradient(W * 0.85, H * 0.08, 10, W * 0.85, H * 0.08, 520);
    glow.addColorStop(0, accent + '55');
    glow.addColorStop(1, accent + '00');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    let y = 96;
    // hlavička appky
    ctx.fillStyle = accent;
    ctx.font = '700 30px "Sora", -apple-system, sans-serif';
    ctx.fillText('CROSSFIT COACH', 64, y);

    y += 60;
    ctx.fillStyle = '#EDEDF2';
    ctx.font = '800 72px "Sora", -apple-system, sans-serif';
    const dateObj = new Date(workout.date + 'T12:00:00');
    const dateLabel = dateObj.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
    y += wrapText(ctx, capitalize(dateLabel), 64, y, W - 128, 78) * 0 + 78;

    ctx.fillStyle = accent;
    ctx.font = '700 40px "Sora", -apple-system, sans-serif';
    ctx.fillText(workout.dayTypeLabel, 64, y);
    y += 70;

    // oddělovací linka
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(64, y); ctx.lineTo(W - 64, y); ctx.stroke();
    y += 56;

    // bloky tréninku
    ctx.textBaseline = 'alphabetic';
    for (const block of workout.blocks) {
      if (y > H - 220) break;
      ctx.fillStyle = accent;
      ctx.font = '700 32px "Sora", -apple-system, sans-serif';
      ctx.fillText(`${block.formatLabel.toUpperCase()} · ${block.title}`, 64, y);
      y += 44;

      ctx.fillStyle = '#B8B8C2';
      ctx.font = '400 26px "Sora", -apple-system, sans-serif';
      if (block.scheme) {
        y += wrapText(ctx, block.scheme, 64, y, W - 128, 34) * 34 + 14;
      }

      for (const ex of block.exercises) {
        if (y > H - 200) break;
        ctx.fillStyle = '#EDEDF2';
        ctx.font = '600 30px "Sora", -apple-system, sans-serif';
        const weightStr = ex.weight ? `  ·  ${ex.weight} ${ex.unit}` : '';
        ctx.fillText(`•  ${ex.name}${weightStr}`, 84, y);
        y += 36;
        if (ex.reps) {
          ctx.fillStyle = '#8E8E96';
          ctx.font = '400 24px "Sora", -apple-system, sans-serif';
          ctx.fillText(String(ex.reps), 104, y);
          y += 34;
        }
      }
      y += 30;
    }

    // patička
    const footerY = H - 110;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.moveTo(64, footerY); ctx.lineTo(W - 64, footerY); ctx.stroke();
    ctx.fillStyle = '#EDEDF2';
    ctx.font = '700 30px "Sora", -apple-system, sans-serif';
    ctx.fillText(`🔥 ~${workout.estKcal} kcal`, 64, footerY + 56);
    ctx.fillStyle = '#8E8E96';
    ctx.font = '400 24px "Sora", -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('#crossfit #wod', W - 64, footerY + 56);
    ctx.textAlign = 'left';

    return canvas;
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function canvasToBlob(canvas) {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95));
  }

  async function downloadCard(canvas, filename) {
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename || 'trenink.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function shareOrDownload(canvas, workout) {
    const filename = `crossfit-${workout.date}.png`;
    const blob = await canvasToBlob(canvas);
    if (navigator.canShare && navigator.share) {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Můj CrossFit trénink' });
          return 'shared';
        } catch (e) {
          if (e && e.name === 'AbortError') return 'cancelled';
        }
      }
    }
    await downloadCard(canvas, filename);
    return 'downloaded';
  }

  return { renderShareCard, downloadCard, shareOrDownload };
})();
