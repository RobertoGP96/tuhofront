"""Generate quickstart-local.pdf with the TUho local run instructions."""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Preformatted,
    Table,
    TableStyle,
    PageBreak,
)


OUTPUT = Path(__file__).resolve().parent.parent / "docs" / "quickstart-local.pdf"


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="H1Custom",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1f2937"),
        spaceAfter=10,
    ))
    styles.add(ParagraphStyle(
        name="H2Custom",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0f766e"),
        spaceBefore=12,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name="BodyCustom",
        parent=styles["BodyText"],
        fontSize=10.5,
        leading=14,
        alignment=TA_LEFT,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name="Small",
        parent=styles["BodyText"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#4b5563"),
    ))
    styles.add(ParagraphStyle(
        name="CodeBlock",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=9,
        leading=11,
        backColor=colors.HexColor("#f3f4f6"),
        borderColor=colors.HexColor("#e5e7eb"),
        borderWidth=0.5,
        borderPadding=6,
        leftIndent=0,
        rightIndent=0,
        spaceAfter=8,
    ))
    return styles


def code_block(text, styles):
    return Preformatted(text, styles["CodeBlock"])


def make_user_table():
    data = [
        ["Usuario", "Contraseña", "Rol"],
        ["admin", "Admin12345", "Admin — ve todo, panel /admin"],
        ["profesor", "Demo12345", "Trámites + reserva de locales"],
        ["trabajador", "Demo12345", "Trámites de mantenimiento"],
        ["estudiante", "Demo12345", "Trámites de secretaría"],
        ["secretaria", "Demo12345", "Panel /secretary"],
        ["gestor_int", "Demo12345", "Panel /gestor-interno"],
        ["gestor_tram", "Demo12345", "Panel /gestor-tramites"],
        ["gestor_res", "Demo12345", "Panel /gestor-reservas"],
        ["externo", "Demo12345", "Usuario público registrado"],
    ]
    table = Table(data, colWidths=[3.2 * cm, 3.2 * cm, 9.6 * cm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("FONTNAME", (0, 1), (0, -1), "Courier-Bold"),
        ("FONTSIZE", (0, 1), (-1, -1), 9.5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.HexColor("#f9fafb"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#e5e7eb")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def build_story(styles):
    story = []

    story.append(Paragraph("TUho — Instrucciones rápidas (local)", styles["H1Custom"]))
    story.append(Paragraph(
        "Levantar backend Django + frontend React/Vite en ~5 minutos para probar la web.",
        styles["Small"],
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("1. Prerrequisitos", styles["H2Custom"]))
    story.append(Paragraph(
        "Python 3.10+ (probado en 3.12) · Node.js 18+ · pnpm 8+ "
        "(<font face='Courier'>npm i -g pnpm</font>) — también podés usar npm.",
        styles["BodyCustom"],
    ))

    story.append(Paragraph("2. Backend — Terminal 1", styles["H2Custom"]))
    story.append(code_block(
        "cd backend\n"
        "\n"
        "# Crear y activar venv\n"
        "python -m venv venv\n"
        "venv\\Scripts\\activate          # Windows (bash: source venv/Scripts/activate)\n"
        "\n"
        "# Instalar dependencias\n"
        "pip install -r requirements.txt\n"
        "\n"
        "# Configurar .env\n"
        "copy env.template .env          # Windows cmd  (bash: cp env.template .env)\n"
        "\n"
        "# Generar SECRET_KEY y pegarla en backend/.env  (linea SECRET_KEY=...)\n"
        "python -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\"\n"
        "\n"
        "# Migraciones + datos demo\n"
        "python manage.py migrate\n"
        "python manage.py seed_demo\n"
        "\n"
        "# Arrancar\n"
        "python manage.py runserver",
        styles,
    ))
    story.append(Paragraph(
        "Queda en <b>http://localhost:8000</b> &nbsp;·&nbsp; Swagger en "
        "<b>http://localhost:8000/api/docs/</b>",
        styles["BodyCustom"],
    ))

    story.append(Paragraph("3. Frontend — Terminal 2", styles["H2Custom"]))
    story.append(code_block(
        "cd client\n"
        "pnpm install                    # o: npm install\n"
        "cp .env.example .env            # opcional (default ya apunta a localhost:8000)\n"
        "pnpm dev                        # o: npm run dev",
        styles,
    ))
    story.append(Paragraph(
        "Queda en <b>http://localhost:5173</b>",
        styles["BodyCustom"],
    ))

    story.append(Paragraph("4. Usuarios de prueba", styles["H2Custom"]))
    story.append(Paragraph(
        "Cargados por <font face='Courier'>seed_demo</font>. Todos activos y con email verificado.",
        styles["BodyCustom"],
    ))
    story.append(Spacer(1, 4))
    story.append(make_user_table())

    story.append(Paragraph("5. Verificación rápida", styles["H2Custom"]))
    checklist = [
        "Login en <b>/login</b> con <font face='Courier'>admin / Admin12345</font> → dashboard de admin.",
        "Sin login: <b>/news</b> muestra 3 noticias sembradas.",
        "Con <font face='Courier'>profesor</font>: <b>/locals</b> muestra 5 locales y <b>/locals/my-reservations</b> 2 reservas.",
        "Con <font face='Courier'>trabajador</font>: <b>/procedures/internal/maintenance</b> con selectores cargados.",
        "API: <b>http://localhost:8000/api/docs/</b> — probá <font face='Courier'>POST /auth/login/</font>.",
    ]
    for i, item in enumerate(checklist, 1):
        story.append(Paragraph(f"{i}. {item}", styles["BodyCustom"]))

    story.append(Paragraph("6. Tips", styles["H2Custom"]))
    tips = [
        "Recargar datos demo (idempotente): <font face='Courier'>python manage.py seed_demo</font> · "
        "resetear: <font face='Courier'>python manage.py seed_demo --reset</font>",
        "Si ves 401 en bucle: borrá <font face='Courier'>access_token</font> y "
        "<font face='Courier'>refresh_token</font> del localStorage y volvé a loguearte.",
        "Después de cada <font face='Courier'>git pull</font>: correr "
        "<font face='Courier'>python manage.py migrate</font>.",
        "CORS o conexión falla: verificá que <font face='Courier'>VITE_API_URL</font> "
        "en <font face='Courier'>client/.env</font> apunte a <font face='Courier'>http://localhost:8000/api/v1</font>.",
    ]
    for tip in tips:
        story.append(Paragraph(f"• {tip}", styles["BodyCustom"]))

    story.append(Spacer(1, 12))
    story.append(Paragraph(
        "Más detalle: <font face='Courier'>README.md</font> en la raíz del repo · "
        "<font face='Courier'>docs/OPERATIONS.md</font> para producción.",
        styles["Small"],
    ))

    return story


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.6 * cm,
        title="TUho — Quickstart local",
        author="TUho",
    )
    styles = build_styles()
    doc.build(build_story(styles))
    print(f"OK: {OUTPUT}")


if __name__ == "__main__":
    main()
