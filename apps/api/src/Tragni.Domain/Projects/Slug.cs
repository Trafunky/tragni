namespace Tragni.Domain.Projects;

public sealed record Slug
{
    private Slug(string value) => Value = value;

    public string Value { get; }

    public static Slug FromTitle(string title)
    {
        var words = title.ToLowerInvariant()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);

        return new Slug(string.Join('-', words));
    }

    public override string ToString() => Value;
}
