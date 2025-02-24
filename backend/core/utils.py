from django.db.models import Model, Field

def to_dict(model_instance: Model, exclude_fields: list[str] = None):
	exclude_fields = exclude_fields or []

	model_fields: list[Field] = model_instance._meta.fields
	model_data: dict = {}

	for field in model_fields:
		if field.name in exclude_fields:
			continue

		field_name = field.name
		field_value = getattr(model_instance, field_name)

		model_data[field_name] = field_value

	return model_data
