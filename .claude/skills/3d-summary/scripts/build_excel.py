"""Excel feedback: apakah qty sheet fit dengan shelving? Input: report.json (hasil window.__report() di viewer)."""
import json, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

R = json.load(open(sys.argv[1])); out = sys.argv[2]
FX = {'wall-p1': 'Wall ke-1 (P1)', 'wall-p2': 'Wall ke-2 (P2)', 'pallet-1': 'Pallet ke-1 (P1)', 'pallet-2': 'Pallet ke-2 (P2)'}
MODE = {'open': 'DISPLAY ONLY', 'pack': 'DISPLAY + PACKING', 'pdq': 'PDQ'}
ST = {'cukup': 'CUKUP', 'kurang': 'KURANG', 'lebar': 'TIDAK MUAT (lebar)', 'tinggi': 'TIDAK MUAT (tinggi)', 'dalam': 'TIDAK MUAT (dalam)'}
HEAD = PatternFill('solid', fgColor='1F2A37'); thin = Side(style='thin', color='D5DBE3'); BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
FILL = {'CUKUP': 'DDF3E4', 'KURANG': 'FBEFD9', 'FIT': 'DDF3E4', 'TIDAK FIT': 'FBE5E5', 'TIDAK MUAT': 'FBE5E5'}

def fill_for(txt):
    for k, c in FILL.items():
        if str(txt).startswith(k): return PatternFill('solid', fgColor=c)

def note(i, sh, W):
    fl = i['flag']
    if fl == 'cukup':
        t = f"Kapasitas {i['cap']} pcs sudah mencapai qty sheet {i['qd']} pcs."
        if i['extra']: t += f" Ada {i['extra']} facing tambahan agar shelving penuh, jadi tampil {i['disp']} pcs."
        return t
    if fl == 'kurang':
        return f"Kapasitas {i['cap']} pcs kurang {i['qd'] - i['cap']} pcs dari qty sheet {i['qd']} pcs. Butuh {i['need']} kolom (lebar {i['need'] * i['fw']:.0f} cm), hanya {i['cols']} kolom muat."
    if fl == 'lebar':
        return f"Tidak kebagian tempat: unit selebar {i['fw']:.0f} cm tidak muat di sisa lebar shelving ({W} cm)."
    if fl == 'tinggi':
        return f"Tinggi unit {i['h']:.1f} cm melebihi tinggi bebas {sh['clear']:.1f} cm."
    return 'Lebih dalam dari kedalaman shelving.'

wb = Workbook()
# ---------------- Detail SKU ----------------
ws = wb.active; ws.title = 'Detail SKU'
cols = ['No', 'SKU', 'Nama SKU', 'Fixture', 'Shelving', 'Kode', 'Prioritas', 'Display w/Packing', 'Qty sheet (pcs)', 'Lebar 1 unit tampil (cm)',
        'Kolom dibutuhkan', 'Kolom dialokasikan', 'Facing tambahan', 'Tampil di shelving penuh (pcs)', 'Kapasitas maks (pcs)', 'Selisih kapasitas - sheet (pcs)', 'Status', 'Qty saran (pcs)', 'Keterangan']
ws.append(cols)
n = 0; rows_by_shelf = []
for f in R:
    for sh in f['shelves']:
        for i in sh['items']:
            n += 1
            sel = i['cap'] - i['qd'] if i['cap'] else -i['qd']
            ws.append([n, i['k'], i['nm'], FX[f['id']], ('Shelving %d' % sh['no']) if f['kind'] == 'wall' else 'Pallet', sh['code'], i['pr'], i['dw'], i['qd'], round(i['fw'], 1) if i['fw'] else None,
                       i['need'] or None, i['cols'], i['extra'], i['disp'], i['cap'], sel, ST[i['flag']], i['disp'], note(i, sh, f['W'])])
for c in range(1, len(cols) + 1):
    h = ws.cell(1, c); h.font = Font(bold=True, color='FFFFFF'); h.fill = HEAD; h.alignment = Alignment(wrap_text=True, vertical='center', horizontal='center')
for row in ws.iter_rows(min_row=2):
    for c in row: c.border = BORDER; c.alignment = Alignment(vertical='top', wrap_text=c.column in (3, 19))
    row[16].fill = fill_for(row[16].value) or PatternFill()
    row[15].number_format = '+#,##0;-#,##0;0'
ws.row_dimensions[1].height = 48; ws.freeze_panes = 'D2'; ws.auto_filter.ref = f"A1:{get_column_letter(len(cols))}{ws.max_row}"
for i, w in enumerate([5, 11, 36, 17, 12, 8, 9, 20, 11, 12, 11, 12, 11, 15, 13, 15, 20, 11, 70], 1): ws.column_dimensions[get_column_letter(i)].width = w

# ---------------- Ringkasan per shelving ----------------
ss = wb.create_sheet('Ringkasan Shelving', 0)
c2 = ['Fixture', 'Shelving', 'Kode', 'Jumlah SKU', 'Qty sheet (pcs)', 'Tampil di shelving penuh (pcs)', 'Kapasitas maks (pcs)', 'Qty sheet terpenuhi (pcs)', 'Terpenuhi (%)',
      'Lebar tersedia (cm)', 'Lebar dibutuhkan qty sheet (cm)', 'Kekurangan lebar (cm)', 'Tinggi bebas (cm)', 'Status', 'Catatan']
ss.append(c2)
for f in R:
    for sh in f['shelves']:
        it = sh['items']; label = ('Shelving %d' % sh['no']) if f['kind'] == 'wall' else 'Pallet'
        if not it:
            ss.append([FX[f['id']], label, sh['code'], 0, 0, 0, 0, 0, None, f['W'], 0, 0, round(sh['clear'], 1), 'KOSONG', 'Media Komunikasi' if sh['media'] else 'Area STOCK'])
            continue
        qty = sum(i['qd'] for i in it); disp = sum(i['disp'] for i in it); cap = sum(i['cap'] for i in it); met = sum(min(i['qd'], i['cap']) for i in it)
        fit = all(i['flag'] == 'cukup' for i in it); lack = max(0, sh['wNeed'] - f['W'])
        bad = [i['k'] for i in it if i['flag'] not in ('cukup', 'kurang')]
        txt = 'Semua SKU cukup.' if fit else ('SKU tidak muat sama sekali: ' + ', '.join(bad) + '. ' if bad else '') + ('Lebar yang dibutuhkan qty sheet melebihi shelving.' if lack else 'Kapasitas tumpuk/kedalaman kurang.')
        ss.append([FX[f['id']], label, sh['code'], len(it), qty, disp, cap, met, round(met / qty, 3), f['W'], round(sh['wNeed'], 1), round(lack, 1), round(sh['clear'], 1), 'FIT' if fit else 'TIDAK FIT', txt])
for c in range(1, len(c2) + 1):
    h = ss.cell(1, c); h.font = Font(bold=True, color='FFFFFF'); h.fill = HEAD; h.alignment = Alignment(wrap_text=True, vertical='center', horizontal='center')
for row in ss.iter_rows(min_row=2):
    for c in row: c.border = BORDER; c.alignment = Alignment(vertical='top', wrap_text=c.column == 15)
    row[8].number_format = '0%'; row[13].fill = fill_for(row[13].value) or PatternFill()
ss.row_dimensions[1].height = 48; ss.freeze_panes = 'C2'
for i, w in enumerate([18, 12, 8, 9, 11, 15, 13, 14, 11, 11, 15, 13, 11, 12, 70], 1): ss.column_dimensions[get_column_letter(i)].width = w

# ---------------- Rekomendasi ----------------
rs = wb.create_sheet('Rekomendasi', 1)
rs.append(['No', 'Fixture / Shelving', 'Temuan', 'Saran'])
rec = []
for f in R:
    for sh in f['shelves']:
        it = sh['items']
        if not it: continue
        lack = max(0, sh['wNeed'] - f['W'])
        lab = FX[f['id']] + (' / Shelving %d (%s)' % (sh['no'], sh['code']) if f['kind'] == 'wall' else ' / ' + sh['code'])
        for i in it:
            if i['flag'] in ('lebar', 'tinggi', 'dalam'):
                rec.append((lab, f"{i['k']} {i['nm']} tidak muat sama sekali ({ST[i['flag']]}). {note(i, sh, f['W'])}",
                            'Pindahkan ke shelving/fixture lain, ubah pola PDQ/ukuran tray, atau konfirmasi satuan qty (pcs atau set).'))
            elif i['flag'] == 'kurang':
                rec.append((lab, f"{i['k']} {i['nm']}: qty sheet {i['qd']} pcs, kapasitas {i['cap']} pcs (kurang {i['qd'] - i['cap']}).",
                            f"Turunkan qty display menjadi {i['cap']} pcs, atau beri fixture/shelving tambahan (butuh lebar {i['need'] * i['fw']:.0f} cm)."))
            elif i['extra']:
                rec.append((lab, f"{i['k']} {i['nm']}: qty sheet {i['qd']} pcs, shelving menyisakan lebar sehingga ada {i['extra']} facing tambahan (tampil {i['disp']} pcs).",
                            f"Bila ingin shelving penuh, naikkan qty display menjadi {i['disp']} pcs."))
for k, (a, b, c) in enumerate(rec, 1): rs.append([k, a, b, c])
for c in range(1, 5):
    h = rs.cell(1, c); h.font = Font(bold=True, color='FFFFFF'); h.fill = HEAD; h.alignment = Alignment(horizontal='center', vertical='center')
for row in rs.iter_rows(min_row=2):
    for c in row: c.border = BORDER; c.alignment = Alignment(vertical='top', wrap_text=True)
rs.freeze_panes = 'A2'
for i, w in enumerate([5, 34, 80, 70], 1): rs.column_dimensions[get_column_letter(i)].width = w

# ---------------- Asumsi ----------------
a = wb.create_sheet('Asumsi')
A = [('Fixture', 'Wall 120 x 50 x 270 cm, plinth 10 cm, 6 shelving (0-5), jarak antar papan 45 cm, tinggi bebas 42,5 cm. Shelving 0 untuk Media Komunikasi (kosong).'),
     ('Pallet', 'Pallet 90 x 90 cm, tinggi susun maks 100 cm di atas pallet 12 cm.'),
     ('Dimensi produk', 'Dari ruparupa.com per SKU; bila tidak tersedia memakai data kemasan SAP ruparupa atau diameter dari nama produk (lihat _manifest.csv).'),
     ('PDQ', 'Tray berisi N pcs sesuai pola (12=4x3, 54=3x3 tumpuk 6, 32=4x4 tumpuk 2, 30=6x5, 25=5x5). Jumlah tray = qty / N. Tray boleh ditumpuk, maks 10 tingkat.'),
     ('Display + packing', '1 unit terbuka di depan, kotak packing di belakangnya (ukuran kotak dari data kemasan). Flat pack berdiri menghadap depan. Kotak boleh ditumpuk sesuai tinggi bebas.'),
     ('Logika isi penuh', 'Qty sheet dipenuhi dulu; sisa lebar diisi dengan menggandakan SKU bergiliran (facing tambahan) sampai shelving penuh. Kedalaman shelving diisi penuh.'),
     ('Kapasitas maks', 'Kolom x baris ke belakang x tumpukan maksimum sesuai tinggi bebas.'),
     ('Qty saran', 'Jumlah yang tampil saat shelving penuh. Untuk SKU yang tidak muat sama sekali nilainya 0.'),
     ('Batasan', 'Bentuk 3D produk berupa perkiraan dari dimensi; hasil fit bergantung pada dimensi tersebut.')]
a.append(['Hal', 'Keterangan'])
for r in A: a.append(list(r))
for c in range(1, 3):
    h = a.cell(1, c); h.font = Font(bold=True, color='FFFFFF'); h.fill = HEAD
for row in a.iter_rows(min_row=2):
    for c in row: c.border = BORDER; c.alignment = Alignment(vertical='top', wrap_text=True)
a.column_dimensions['A'].width = 22; a.column_dimensions['B'].width = 120
wb.save(out); print(out, 'rows', ws.max_row - 1, 'rec', len(rec))
