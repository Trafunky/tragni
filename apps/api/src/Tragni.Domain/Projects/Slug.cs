namespace Tragni.Domain.Projects;

public sealed record Slug
{
    private Slug(string value) => Value = value;

    public string Value { get; }

    public static Slug FromTitle(string title) => new(title.ToLowerInvariant());

    public override string ToString() => Value;
}
