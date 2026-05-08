CREATE TABLE "empresas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurante_id" uuid NOT NULL,
	"documento_tipo" text NOT NULL,
	"documento_id" text NOT NULL,
	"razon_social" text NOT NULL,
	"direccion_facturacion" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_restaurante_id_restaurantes_id_fk" FOREIGN KEY ("restaurante_id") REFERENCES "public"."restaurantes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "empresas_restaurante_documento_idx" ON "empresas" USING btree ("restaurante_id","documento_id");