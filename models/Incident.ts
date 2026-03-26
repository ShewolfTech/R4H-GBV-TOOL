import mongoose, { Schema, Document } from "mongoose";

export interface IIncident extends Document {
  caseRef:      string;
  dateRecorded: Date;
  status:       "Open" | "Referred" | "Closed";
  survivor:     Record<string, any>;
  incident:     Record<string, any>;
  context:      Record<string, any>;
  reporting:    Record<string, any>;
  needs:        Record<string, any>;
  reflection:   Record<string, any>;
  caseManagement: Record<string, any>;
}

const IncidentSchema = new Schema<IIncident>(
  {
    caseRef:      { type: String, required: true, unique: true },
    dateRecorded: { type: Date, default: Date.now },
    status:       { type: String, enum: ["Open","Referred","Closed"], default: "Open" },
    survivor:     { type: Schema.Types.Mixed, default: {} },
    incident:     { type: Schema.Types.Mixed, default: {} },
    context:      { type: Schema.Types.Mixed, default: {} },
    reporting:    { type: Schema.Types.Mixed, default: {} },
    needs:        { type: Schema.Types.Mixed, default: {} },
    reflection:   { type: Schema.Types.Mixed, default: {} },
    caseManagement: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.Incident ||
  mongoose.model<IIncident>("Incident", IncidentSchema);
