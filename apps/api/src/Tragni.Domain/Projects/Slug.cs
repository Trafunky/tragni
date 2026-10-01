namespace Tragni.Domain.Projects;

using Tragni.Domain.Common;

public sealed record Slug
{
    private Slug(string value) => Value = value;

    public string Value { get; }

    public static Slug FromTitle(string title)
    {
        ArgumentNullException.ThrowIfNull(title);

        var words = title.ToLowerInvariant()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);

        var value = string.Join('-', words);

        if (value.Length == 0)
        {
            throw new DomainException(
                "A title must contain at least one character that can be used in a slug.");
        }

        return new Slug(value);
    }

    public override string ToString() => Value;
}
