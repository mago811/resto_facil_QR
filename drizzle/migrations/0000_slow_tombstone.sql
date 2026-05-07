CREATE TABLE "facturas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero_factura" text NOT NULL,
	"sesion_id" uuid NOT NULL,
	"restaurante_id" uuid NOT NULL,
	"documento_tipo" text NOT NULL,
	"documento_id" text NOT NULL,
	"razon_social" text NOT NULL,
	"direccion_facturacion" text NOT NULL,
	"email_cliente" text,
	"base_imponible" numeric(10, 2) NOT NULL,
	"iva_rate" numeric(4, 2) NOT NULL,
	"cuota_iva" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"pdf_url" text,
	"impresa" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facturas_numero_factura_unique" UNIQUE("numero_factura"),
	CONSTRAINT "facturas_sesion_id_unique" UNIQUE("sesion_id")
);
--> statement-breakpoint
CREATE TABLE "mesas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer NOT NULL,
	"nombre" text,
	"restaurante_id" uuid NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurantes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nombre" text NOT NULL,
	"cif" text NOT NULL,
	"razon_social" text NOT NULL,
	"direccion" text NOT NULL,
	"iva_porcentaje" numeric(4, 2) DEFAULT '0.10' NOT NULL,
	"factura_seq" integer DEFAULT 0 NOT NULL,
	"pos_api_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restaurantes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sesiones_pos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mesa_id" uuid NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"descripcion" text,
	"estado" text DEFAULT 'abierta' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"restaurante_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_sesion_id_sesiones_pos_id_fk" FOREIGN KEY ("sesion_id") REFERENCES "public"."sesiones_pos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_restaurante_id_restaurantes_id_fk" FOREIGN KEY ("restaurante_id") REFERENCES "public"."restaurantes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_restaurante_id_restaurantes_id_fk" FOREIGN KEY ("restaurante_id") REFERENCES "public"."restaurantes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones_pos" ADD CONSTRAINT "sesiones_pos_mesa_id_mesas_id_fk" FOREIGN KEY ("mesa_id") REFERENCES "public"."mesas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_restaurante_id_restaurantes_id_fk" FOREIGN KEY ("restaurante_id") REFERENCES "public"."restaurantes"("id") ON DELETE no action ON UPDATE no action;